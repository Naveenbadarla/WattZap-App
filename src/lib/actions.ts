"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout, requireUser, switchSite } from "@/lib/auth";
import { db, userCanAccessSite } from "@/lib/db";
import {
  canActivateProduct,
  canCompleteAction,
  canDecideOpportunity,
} from "@/lib/permissions";
import type { OpportunityStatus, ProductSlug } from "@/lib/types";

/**
 * Server actions — the only write path in the app. Every mutation:
 *  1. authenticates the session,
 *  2. checks tenant access (user ↔ site),
 *  3. checks role permission,
 *  4. validates input with zod,
 *  5. records an activity/audit event where relevant.
 */

// ---------- Auth ----------

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const result = login(parsed.data.email, parsed.data.password);
  if (!result.ok) return { error: result.error };
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  logout();
  redirect("/login");
}

export async function switchSiteAction(formData: FormData): Promise<void> {
  requireUser();
  const siteId = z.string().min(1).parse(formData.get("siteId"));
  switchSite(siteId);
  revalidatePath("/", "layout");
}

// ---------- Opportunities ----------

const decisionSchema = z.object({
  opportunityId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(2000).optional(),
});

export async function decideOpportunityAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const parsed = decisionSchema.parse({
    opportunityId: formData.get("opportunityId"),
    decision: formData.get("decision"),
    comment: formData.get("comment") || undefined,
  });
  const opp = db().opportunities.find((o) => o.id === parsed.opportunityId);
  if (!opp) throw new Error("Opportunity not found");
  if (!userCanAccessSite(user, opp.siteId)) throw new Error("Permission denied");
  if (!canDecideOpportunity(user)) throw new Error("Your role cannot approve or reject opportunities");

  opp.status = parsed.decision as OpportunityStatus;
  opp.activity.push({
    id: `ev-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    actor: user.name,
    event: parsed.decision === "approved" ? "Approved" : "Rejected",
    comment: parsed.comment,
  });
  // Keep the savings ledger in step.
  const sav = db().savings.find((s) => s.opportunityId === opp.id);
  if (sav && parsed.decision === "approved" && sav.stage === "identified") {
    sav.stage = "approved";
    sav.customerApprover = user.name;
    sav.status = `Approved by ${user.name}`;
    sav.updatedAt = new Date().toISOString().slice(0, 10);
  }
  revalidatePath("/", "layout");
}

const commentSchema = z.object({
  opportunityId: z.string().min(1),
  comment: z.string().min(1, "Write a question or comment").max(2000),
});

export async function commentOpportunityAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const parsed = commentSchema.parse({
    opportunityId: formData.get("opportunityId"),
    comment: formData.get("comment"),
  });
  const opp = db().opportunities.find((o) => o.id === parsed.opportunityId);
  if (!opp) throw new Error("Opportunity not found");
  if (!userCanAccessSite(user, opp.siteId)) throw new Error("Permission denied");
  opp.activity.push({
    id: `ev-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    actor: user.name,
    event: "Question asked",
    comment: parsed.comment,
  });
  revalidatePath(`/opportunities/${opp.id}`);
}

// ---------- Actions / tasks ----------

export async function completeActionItemAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const actionId = z.string().min(1).parse(formData.get("actionId"));
  const item = db().actions.find((a) => a.id === actionId);
  if (!item) throw new Error("Action not found");
  if (!userCanAccessSite(user, item.siteId)) throw new Error("Permission denied");
  if (!canCompleteAction(user)) throw new Error("Your role cannot complete actions");
  item.status = "done";
  item.completedAt = new Date().toISOString().slice(0, 10);
  revalidatePath("/", "layout");
}

export async function requestSupportForActionAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const actionId = z.string().min(1).parse(formData.get("actionId"));
  const item = db().actions.find((a) => a.id === actionId);
  if (!item) throw new Error("Action not found");
  if (!userCanAccessSite(user, item.siteId)) throw new Error("Permission denied");
  item.status = "support_requested";
  db().supportRequests.push({
    id: `sr-${Date.now()}`,
    siteId: item.siteId,
    userId: user.id,
    subject: `Support requested: ${item.title}`,
    message: item.detail,
    status: "open",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  revalidatePath("/", "layout");
}

// ---------- Alerts ----------

export async function markAlertReadAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const alertId = z.string().min(1).parse(formData.get("alertId"));
  const alert = db().alerts.find((a) => a.id === alertId);
  if (!alert) throw new Error("Alert not found");
  if (!userCanAccessSite(user, alert.siteId)) throw new Error("Permission denied");
  alert.read = true;
  revalidatePath("/alerts");
}

// ---------- Products ----------

const activateSchema = z.object({
  siteId: z.string().min(1),
  product: z.string().min(1),
});

/**
 * Customer requests activation of an eligible/recommended product.
 * The product moves to `onboarding` — activation is completed by WattZap
 * after commercial steps, never silently by the frontend.
 */
export async function requestActivationAction(formData: FormData): Promise<void> {
  const { user } = requireUser();
  const parsed = activateSchema.parse({
    siteId: formData.get("siteId"),
    product: formData.get("product"),
  });
  if (!userCanAccessSite(user, parsed.siteId)) throw new Error("Permission denied");
  if (!canActivateProduct(user)) throw new Error("Only the business owner or finance user can activate products");
  const ent = db().entitlements.find(
    (e) => e.siteId === parsed.siteId && e.product === (parsed.product as ProductSlug)
  );
  if (!ent) throw new Error("Product not available for this site");
  if (!["eligible", "recommended"].includes(ent.state)) {
    throw new Error("This product is not ready to activate yet");
  }
  ent.state = "onboarding";
  ent.stateReason = `Activation requested by ${user.name} on ${new Date().toLocaleDateString("en-IN")}. WattZap will contact you within 1 working day to begin onboarding.`;
  ent.activatedAt = new Date().toISOString().slice(0, 10);
  ent.updatedAt = ent.activatedAt;
  revalidatePath("/", "layout");
}

// ---------- Support ----------

const supportSchema = z.object({
  subject: z.string().min(3, "Add a short subject").max(200),
  message: z.string().min(5, "Describe your question").max(4000),
});

export async function createSupportRequestAction(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const { user, activeSite } = requireUser();
  const parsed = supportSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  db().supportRequests.push({
    id: `sr-${Date.now()}`,
    siteId: activeSite.id,
    userId: user.id,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "open",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  revalidatePath("/support");
  return { ok: true };
}

// ---------- Documents (demo upload records metadata only) ----------

const uploadSchema = z.object({
  name: z.string().min(3).max(200),
  category: z.string().min(1),
});

export async function recordUploadAction(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const { user, activeSite } = requireUser();
  const parsed = uploadSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: "Enter a file name and category" };
  db().documents.unshift({
    id: `doc-${Date.now()}`,
    siteId: activeSite.id,
    category: parsed.data.category as never,
    name: parsed.data.name,
    uploadedBy: user.name,
    uploadedOn: new Date().toISOString().slice(0, 10),
    sizeKb: 0,
    fileType: "pdf",
  });
  revalidatePath("/documents");
  return { ok: true };
}
