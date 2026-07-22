"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout, requireUser, switchSite } from "@/lib/auth";
import { repo, userCanAccessSite } from "@/lib/db";
import {
  canActivateProduct,
  canCompleteAction,
  canDecideOpportunity,
} from "@/lib/permissions";
import type { ProductSlug } from "@/lib/types";

/**
 * Server actions — the only write path in the app. Every mutation:
 *  1. authenticates the session,
 *  2. checks tenant access (user ↔ site),
 *  3. checks role permission,
 *  4. validates input with zod,
 *  5. records an activity/audit event where relevant.
 * Writes go through the repository seam, so they work identically on the
 * demo store and on Supabase.
 */

const today = () => new Date().toISOString().slice(0, 10);

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
  const result = await login(parsed.data.email, parsed.data.password);
  if (!result.ok) return { error: result.error };
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}

export async function switchSiteAction(formData: FormData): Promise<void> {
  await requireUser();
  const siteId = z.string().min(1).parse(formData.get("siteId"));
  await switchSite(siteId);
  revalidatePath("/", "layout");
}

// ---------- Opportunities ----------

const decisionSchema = z.object({
  opportunityId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().max(2000).optional(),
});

export async function decideOpportunityAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const parsed = decisionSchema.parse({
    opportunityId: formData.get("opportunityId"),
    decision: formData.get("decision"),
    comment: formData.get("comment") || undefined,
  });
  const opp = await repo().getOpportunity(parsed.opportunityId);
  if (!opp) throw new Error("Opportunity not found");
  if (!(await userCanAccessSite(user, opp.siteId))) throw new Error("Permission denied");
  if (!canDecideOpportunity(user)) {
    throw new Error("Your role cannot approve or reject opportunities");
  }

  await repo().updateOpportunityStatus(opp.id, parsed.decision, {
    id: `ev-${Date.now()}`,
    date: today(),
    actor: user.name,
    event: parsed.decision === "approved" ? "Approved" : "Rejected",
    comment: parsed.comment,
  });
  if (parsed.decision === "approved") {
    const sav = await repo().findSavingsByOpportunity(opp.id);
    if (sav && sav.stage === "identified") {
      await repo().progressSavingsForOpportunity(opp.id, {
        stage: "approved",
        approverName: user.name,
        status: `Approved by ${user.name}`,
      });
    }
  }
  revalidatePath("/", "layout");
}

const commentSchema = z.object({
  opportunityId: z.string().min(1),
  comment: z.string().min(1, "Write a question or comment").max(2000),
});

export async function commentOpportunityAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const parsed = commentSchema.parse({
    opportunityId: formData.get("opportunityId"),
    comment: formData.get("comment"),
  });
  const opp = await repo().getOpportunity(parsed.opportunityId);
  if (!opp) throw new Error("Opportunity not found");
  if (!(await userCanAccessSite(user, opp.siteId))) throw new Error("Permission denied");
  await repo().addOpportunityActivity(opp.id, {
    id: `ev-${Date.now()}`,
    date: today(),
    actor: user.name,
    event: "Question asked",
    comment: parsed.comment,
  });
  revalidatePath(`/opportunities/${opp.id}`);
}

// ---------- Actions / tasks ----------

export async function completeActionItemAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const actionId = z.string().min(1).parse(formData.get("actionId"));
  const item = await repo().getAction(actionId);
  if (!item) throw new Error("Action not found");
  if (!(await userCanAccessSite(user, item.siteId))) throw new Error("Permission denied");
  if (!canCompleteAction(user)) throw new Error("Your role cannot complete actions");
  await repo().completeAction(item.id, today());
  revalidatePath("/", "layout");
}

export async function requestSupportForActionAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const actionId = z.string().min(1).parse(formData.get("actionId"));
  const item = await repo().getAction(actionId);
  if (!item) throw new Error("Action not found");
  if (!(await userCanAccessSite(user, item.siteId))) throw new Error("Permission denied");
  await repo().markActionSupportRequested(item.id);
  await repo().createSupportRequest({
    siteId: item.siteId,
    userId: user.id,
    subject: `Support requested: ${item.title}`,
    message: item.detail,
    status: "open",
    createdAt: today(),
  });
  revalidatePath("/", "layout");
}

// ---------- Alerts ----------

export async function markAlertReadAction(formData: FormData): Promise<void> {
  const { user } = await requireUser();
  const alertId = z.string().min(1).parse(formData.get("alertId"));
  const alert = await repo().getAlert(alertId);
  if (!alert) throw new Error("Alert not found");
  if (!(await userCanAccessSite(user, alert.siteId))) throw new Error("Permission denied");
  await repo().markAlertRead(alert.id, user.id);
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
  const { user } = await requireUser();
  const parsed = activateSchema.parse({
    siteId: formData.get("siteId"),
    product: formData.get("product"),
  });
  if (!(await userCanAccessSite(user, parsed.siteId))) throw new Error("Permission denied");
  if (!canActivateProduct(user)) {
    throw new Error("Only the business owner or finance user can activate products");
  }
  const ents = await repo().entitlementsForSite(parsed.siteId);
  const ent = ents.find((e) => e.product === (parsed.product as ProductSlug));
  if (!ent) throw new Error("Product not available for this site");
  if (!["eligible", "recommended"].includes(ent.state)) {
    throw new Error("This product is not ready to activate yet");
  }
  await repo().setEntitlementState(parsed.siteId, parsed.product as ProductSlug, {
    state: "onboarding",
    stateReason: `Activation requested by ${user.name} on ${new Date().toLocaleDateString(
      "en-IN"
    )}. WattZap will contact you within 1 working day to begin onboarding.`,
    activatedAt: today(),
  });
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
  const { user, activeSite } = await requireUser();
  const parsed = supportSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  await repo().createSupportRequest({
    siteId: activeSite.id,
    userId: user.id,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "open",
    createdAt: today(),
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
  const { user, activeSite } = await requireUser();
  const parsed = uploadSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: "Enter a file name and category" };
  await repo().createDocument({
    siteId: activeSite.id,
    category: parsed.data.category as never,
    name: parsed.data.name,
    uploadedBy: user.name,
    uploadedOn: today(),
    sizeKb: 0,
    fileType: "pdf",
  });
  revalidatePath("/documents");
  return { ok: true };
}
