import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import type { Repository } from "@/lib/repo/types";
import type {
  ActionItem,
  ActivityEvent,
  Alert,
  DemandEvent,
  DocumentItem,
  Entitlement,
  MonthlyBill,
  OnboardingMilestone,
  OnboardingStep,
  Opportunity,
  PFEvent,
  Report,
  SavingsEntry,
  Site,
  SupportRequest,
  User,
} from "@/lib/types";

/**
 * Supabase adapter. Maps the SQL schema (snake_case, see /supabase/migrations)
 * to the domain types. Reached only through the repository seam after the
 * server actions have performed session + tenant + role checks; RLS provides
 * the second line of defence for any client-credential access.
 */

const db = () => serviceClient();

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`[supabase:${context}] ${error?.message ?? "unknown error"}`);
}

// ---------- row mappers ----------

function mapSite(r: Record<string, never> | any): Site {
  return {
    id: r.id,
    orgId: r.org_id,
    name: r.name,
    shortName: r.short_name,
    industry: r.industry,
    location: r.location,
    state: r.state,
    connectionType: r.connection_type,
    discom: r.discom ?? "",
    sanctionedDemandKva: Number(r.sanctioned_demand_kva ?? 0),
    contractDemandKva: Number(r.contract_demand_kva ?? 0),
    connectedLoadKw: Number(r.connected_load_kw ?? 0),
    operatingHours: r.operating_hours ?? "",
    monthlyProductionTonnes: r.monthly_production ? Number(r.monthly_production) : undefined,
    productionUnit: r.production_unit ?? undefined,
    solarInstalledKw: Number(r.solar_installed_kw ?? 0),
    roofAreaSqft: r.roof_area_sqft ? Number(r.roof_area_sqft) : undefined,
    dataReadiness: r.data_readiness,
    maturityLevel: r.maturity_level,
    health: r.health,
    healthReason: r.health_reason ?? "",
    createdAt: r.created_at?.slice(0, 10) ?? "",
  };
}

function mapUser(p: any, siteIds: string[], isStaff: boolean): User {
  return {
    id: p.id,
    orgId: p.org_id,
    name: p.name,
    email: p.email ?? "",
    password: "", // never stored here — Supabase Auth owns credentials
    role: p.role,
    internalRole: p.internal_role ?? undefined,
    phone: p.phone ?? undefined,
    siteIds,
    allSites: isStaff || ["owner", "finance"].includes(p.role),
  };
}

function mapEntitlement(r: any): Entitlement {
  return {
    id: r.id,
    siteId: r.site_id,
    product: r.product_slug,
    state: r.state,
    stateReason: r.state_reason ?? "",
    unlockSteps: (r.unlock_steps as string[]) ?? [],
    estimatedAnnualValue: r.estimated_annual_value ? Number(r.estimated_annual_value) : undefined,
    recommendedByWattZap: r.recommended,
    activatedAt: r.activated_at ?? undefined,
    updatedAt: r.updated_at?.slice(0, 10) ?? "",
  };
}

function mapBill(r: any): MonthlyBill {
  return {
    id: r.id,
    siteId: r.site_id,
    month: r.month,
    billNumber: r.bill_number ?? "",
    amount: Number(r.amount),
    unitsKwh: Number(r.units_kwh ?? 0),
    recordedMdKva: Number(r.recorded_md_kva ?? 0),
    billedMdKva: Number(r.billed_md_kva ?? 0),
    powerFactor: Number(r.power_factor ?? 0),
    pfPenalty: Number(r.pf_penalty ?? 0),
    mdPenalty: Number(r.md_penalty ?? 0),
    todPeakUnits: Number(r.tod_peak_units ?? 0),
    todNormalUnits: Number(r.tod_normal_units ?? 0),
    todOffpeakUnits: Number(r.tod_offpeak_units ?? 0),
    anomalies: (r.anomalies as string[]) ?? [],
    status: r.status,
    dataTag: r.tag,
  };
}

function mapOpportunity(r: any, activity: ActivityEvent[]): Opportunity {
  return {
    id: r.id,
    siteId: r.site_id,
    title: r.title,
    plainExplanation: r.plain_explanation,
    whatHappened: r.what_happened ?? "",
    whyItMatters: r.why_it_matters ?? "",
    technicalDetail: r.technical_detail ?? "",
    annualSaving: Number(r.annual_saving),
    implementationCost: Number(r.implementation_cost ?? 0),
    paybackMonths: r.payback_months === null ? null : Number(r.payback_months),
    confidence: r.confidence,
    complexity: r.complexity,
    priority: r.priority,
    product: r.product_slug,
    requiredAction: r.required_action ?? "",
    decisionOwnerRole: r.decision_owner_role,
    status: r.status,
    evidence: (r.evidence as string[]) ?? [],
    identifiedOn: r.identified_on,
    dataTag: r.tag,
    activity,
  };
}

function mapActivity(r: any): ActivityEvent {
  return {
    id: r.id,
    date: r.happened_on,
    actor: r.actor,
    event: r.event,
    comment: r.comment ?? undefined,
  };
}

function mapSavings(r: any): SavingsEntry {
  return {
    id: r.id,
    siteId: r.site_id,
    opportunityId: r.opportunity_id ?? undefined,
    title: r.title,
    product: r.product_slug,
    stage: r.stage,
    expectedAnnual: Number(r.expected_annual),
    verifiedAnnual: r.verified_annual === null ? undefined : Number(r.verified_annual),
    monthlyExpected: Number(r.monthly_expected ?? 0),
    monthlyVerified: r.monthly_verified === null ? undefined : Number(r.monthly_verified),
    baseline: r.baseline_note ?? "",
    measurementPeriod: r.measurement_period ?? undefined,
    method: r.method ?? "",
    adjustments: r.adjustments ?? undefined,
    varianceReason: r.variance_reason ?? undefined,
    confidence: r.confidence,
    evidence: (r.evidence as string[]) ?? [],
    wattzapReviewer: r.wattzap_reviewer_name ?? undefined,
    customerApprover: r.customer_approver_name ?? undefined,
    status: r.status ?? "",
    dataTag: r.tag,
    updatedAt: r.updated_at?.slice(0, 10) ?? "",
  };
}

function mapAction(r: any): ActionItem {
  return {
    id: r.id,
    siteId: r.site_id,
    opportunityId: r.opportunity_id ?? undefined,
    title: r.title,
    detail: r.detail ?? "",
    monthlyValue: Number(r.monthly_value ?? 0),
    difficulty: r.difficulty,
    assigneeRole: r.assignee_role,
    assigneeName: r.assignee_name ?? "",
    dueDate: r.due_date ?? "",
    status: r.status,
    completedAt: r.completed_at ?? undefined,
  };
}

function mapAlert(r: any, read: boolean): Alert {
  return {
    id: r.id,
    siteId: r.site_id,
    category: r.category,
    title: r.title,
    whatHappened: r.what_happened,
    whenHappened: r.happened_at?.replace("T", " ").slice(0, 16) ?? "",
    financialImpact: r.financial_impact === null ? null : Number(r.financial_impact),
    whyItMatters: r.why_it_matters ?? "",
    recommendedAction: r.recommended_action ?? "",
    deadline: r.deadline ?? undefined,
    responsibleRole: r.responsible_role,
    product: r.product_slug,
    evidence: r.evidence ?? "",
    read,
    dataTag: r.tag,
  };
}

function mapReport(r: any): Report {
  return {
    id: r.id,
    siteId: r.site_id,
    type: r.report_type,
    title: r.title,
    period: r.period ?? "",
    generatedOn: r.generated_on,
    version: r.version,
    status: r.status,
    approvedBy: r.approved_by_name ?? undefined,
    reviewer: r.reviewer_name ?? undefined,
    summary: r.summary ?? "",
    dataTag: r.tag,
  };
}

function mapDocument(r: any): DocumentItem {
  return {
    id: r.id,
    siteId: r.site_id,
    category: r.category,
    name: r.name,
    uploadedBy: r.uploaded_by_name ?? "",
    uploadedOn: r.created_at?.slice(0, 10) ?? "",
    sizeKb: Number(r.size_kb ?? 0),
    fileType: r.file_type ?? "pdf",
  };
}

function mapOnboarding(r: any): OnboardingStep {
  return {
    id: r.id,
    siteId: r.site_id,
    step: r.step,
    title: r.title,
    description: r.description ?? "",
    status: r.status,
    valueMessage: r.value_message ?? undefined,
  };
}

function mapMilestone(r: any): OnboardingMilestone {
  return {
    id: r.id,
    siteId: r.site_id,
    product: r.product_slug,
    step: r.step,
    title: r.title,
    status: r.status,
    date: r.happened_on ?? undefined,
    note: r.note ?? undefined,
  };
}

function mapPf(r: any): PFEvent {
  return {
    id: r.id,
    siteId: r.site_id,
    month: r.month,
    avgPf: Number(r.avg_pf ?? 0),
    worstPf: Number(r.worst_pf ?? 0),
    worstWindow: r.worst_window ?? "",
    penalty: Number(r.penalty ?? 0),
    likelyCause: r.likely_cause ?? "—",
    dataTag: r.tag,
  };
}

function mapDemand(r: any): DemandEvent {
  return {
    id: r.id,
    siteId: r.site_id,
    date: r.happened_on,
    time: r.happened_at?.slice(0, 5) ?? "",
    peakKva: Number(r.peak_kva),
    thresholdKva: Number(r.threshold_kva),
    durationMin: Number(r.duration_min ?? 0),
    likelyCause: r.likely_cause ?? "",
    estimatedCost: Number(r.estimated_cost ?? 0),
    dataTag: r.tag,
  };
}

function mapSupport(r: any): SupportRequest {
  return {
    id: r.id,
    siteId: r.site_id,
    userId: r.user_id,
    subject: r.subject,
    message: r.message,
    status: r.status,
    createdAt: r.created_at?.slice(0, 10) ?? "",
  };
}

// ---------- user assembly ----------

async function assembleUser(profile: any): Promise<User> {
  const [{ data: memberships }, { data: staff }] = await Promise.all([
    db().from("site_memberships").select("site_id").eq("user_id", profile.id),
    db().from("wattzap_staff").select("user_id").eq("user_id", profile.id).maybeSingle(),
  ]);
  return mapUser(profile, (memberships ?? []).map((m: any) => m.site_id), Boolean(staff));
}

// ---------- repository ----------

export const supabaseRepo: Repository = {
  async getUserByEmail(email) {
    const { data, error } = await db()
      .from("profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    if (error) fail("getUserByEmail", error);
    return data ? assembleUser(data) : null;
  },
  async getUserById(id) {
    const { data, error } = await db().from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) fail("getUserById", error);
    return data ? assembleUser(data) : null;
  },
  async listOrgUsers(orgId) {
    const { data, error } = await db().from("profiles").select("*").eq("org_id", orgId);
    if (error) fail("listOrgUsers", error);
    return Promise.all((data ?? []).map(assembleUser));
  },
  async getOrgName(orgId) {
    if (!orgId) return "WattZap";
    const { data } = await db().from("organisations").select("name").eq("id", orgId).maybeSingle();
    return data?.name ?? "Unknown organisation";
  },
  async getSite(siteId) {
    const { data, error } = await db().from("sites").select("*").eq("id", siteId).maybeSingle();
    if (error) fail("getSite", error);
    return data ? mapSite(data) : null;
  },
  async sitesForUser(user) {
    if (user.orgId === null) return this.listAllSites(); // WattZap staff
    if (user.allSites) {
      const { data, error } = await db()
        .from("sites")
        .select("*")
        .eq("org_id", user.orgId)
        .is("deleted_at", null)
        .order("created_at");
      if (error) fail("sitesForUser", error);
      return (data ?? []).map(mapSite);
    }
    if (user.siteIds.length === 0) return [];
    const { data, error } = await db().from("sites").select("*").in("id", user.siteIds);
    if (error) fail("sitesForUser", error);
    return (data ?? []).map(mapSite);
  },
  async listAllSites() {
    const { data, error } = await db()
      .from("sites")
      .select("*")
      .is("deleted_at", null)
      .order("created_at");
    if (error) fail("listAllSites", error);
    return (data ?? []).map(mapSite);
  },

  async entitlementsForSite(siteId) {
    const { data, error } = await db()
      .from("product_entitlements")
      .select("*")
      .eq("site_id", siteId);
    if (error) fail("entitlementsForSite", error);
    return (data ?? []).map(mapEntitlement);
  },
  async billsForSite(siteId) {
    const { data, error } = await db()
      .from("electricity_bills")
      .select("*")
      .eq("site_id", siteId)
      .order("month");
    if (error) fail("billsForSite", error);
    return (data ?? []).map(mapBill);
  },
  async opportunitiesForSite(siteId) {
    const { data, error } = await db()
      .from("opportunities")
      .select("*")
      .eq("site_id", siteId)
      .is("deleted_at", null)
      .order("priority")
      .order("annual_saving", { ascending: false });
    if (error) fail("opportunitiesForSite", error);
    const ids = (data ?? []).map((r: any) => r.id);
    const { data: acts } = ids.length
      ? await db()
          .from("opportunity_activity")
          .select("*")
          .in("opportunity_id", ids)
          .order("happened_on")
      : { data: [] };
    return (data ?? []).map((r: any) =>
      mapOpportunity(r, (acts ?? []).filter((a: any) => a.opportunity_id === r.id).map(mapActivity))
    );
  },
  async getOpportunity(id) {
    const { data, error } = await db().from("opportunities").select("*").eq("id", id).maybeSingle();
    if (error) fail("getOpportunity", error);
    if (!data) return null;
    const { data: acts } = await db()
      .from("opportunity_activity")
      .select("*")
      .eq("opportunity_id", id)
      .order("happened_on");
    return mapOpportunity(data, (acts ?? []).map(mapActivity));
  },
  async savingsForSite(siteId) {
    const { data, error } = await db().from("savings_entries").select("*").eq("site_id", siteId);
    if (error) fail("savingsForSite", error);
    return (data ?? []).map(mapSavings);
  },
  async getSavingsEntry(id) {
    const { data, error } = await db().from("savings_entries").select("*").eq("id", id).maybeSingle();
    if (error) fail("getSavingsEntry", error);
    return data ? mapSavings(data) : null;
  },
  async findSavingsByOpportunity(opportunityId) {
    const { data, error } = await db()
      .from("savings_entries")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .maybeSingle();
    if (error) fail("findSavingsByOpportunity", error);
    return data ? mapSavings(data) : null;
  },
  async actionsForSite(siteId) {
    const { data, error } = await db()
      .from("actions")
      .select("*")
      .eq("site_id", siteId)
      .order("due_date");
    if (error) fail("actionsForSite", error);
    return (data ?? []).map(mapAction);
  },
  async getAction(id) {
    const { data, error } = await db().from("actions").select("*").eq("id", id).maybeSingle();
    if (error) fail("getAction", error);
    return data ? mapAction(data) : null;
  },
  async alertsForSite(siteId, userId) {
    const [{ data, error }, { data: reads }] = await Promise.all([
      db().from("alerts").select("*").eq("site_id", siteId).order("happened_at", { ascending: false }),
      db().from("alert_reads").select("alert_id").eq("user_id", userId),
    ]);
    if (error) fail("alertsForSite", error);
    const readSet = new Set((reads ?? []).map((r: any) => r.alert_id));
    return (data ?? []).map((r: any) => mapAlert(r, readSet.has(r.id)));
  },
  async getAlert(id) {
    const { data, error } = await db().from("alerts").select("*").eq("id", id).maybeSingle();
    if (error) fail("getAlert", error);
    return data ? mapAlert(data, false) : null;
  },
  async reportsForSite(siteId) {
    const { data, error } = await db()
      .from("reports")
      .select("*")
      .eq("site_id", siteId)
      .order("generated_on", { ascending: false });
    if (error) fail("reportsForSite", error);
    return (data ?? []).map(mapReport);
  },
  async documentsForSite(siteId) {
    const { data, error } = await db()
      .from("documents")
      .select("*")
      .eq("site_id", siteId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) fail("documentsForSite", error);
    return (data ?? []).map(mapDocument);
  },
  async onboardingForSite(siteId) {
    const { data, error } = await db()
      .from("onboarding_steps")
      .select("*")
      .eq("site_id", siteId)
      .order("step");
    if (error) fail("onboardingForSite", error);
    return (data ?? []).map(mapOnboarding);
  },
  async milestonesFor(siteId, product) {
    const { data, error } = await db()
      .from("product_milestones")
      .select("*")
      .eq("site_id", siteId)
      .eq("product_slug", product)
      .order("step");
    if (error) fail("milestonesFor", error);
    return (data ?? []).map(mapMilestone);
  },
  async pfEventsForSite(siteId) {
    const { data, error } = await db()
      .from("power_factor_records")
      .select("*")
      .eq("site_id", siteId)
      .order("month");
    if (error) fail("pfEventsForSite", error);
    return (data ?? []).map(mapPf);
  },
  async demandEventsForSite(siteId) {
    const { data, error } = await db()
      .from("demand_records")
      .select("*")
      .eq("site_id", siteId)
      .order("happened_on", { ascending: false });
    if (error) fail("demandEventsForSite", error);
    return (data ?? []).map(mapDemand);
  },
  async todProfileForSite(siteId) {
    const { data, error } = await db()
      .from("tod_profile_points")
      .select("*")
      .eq("site_id", siteId)
      .order("hour");
    if (error) fail("todProfileForSite", error);
    return (data ?? []).map((r: any) => ({
      hour: r.hour,
      kva: Number(r.kva),
      kwh: Number(r.kwh),
    }));
  },
  async supportRequestsForSite(siteId) {
    const { data, error } = await db()
      .from("support_requests")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    if (error) fail("supportRequestsForSite", error);
    return (data ?? []).map(mapSupport);
  },

  async updateOpportunityStatus(id, status, event) {
    const { error } = await db().from("opportunities").update({ status }).eq("id", id);
    if (error) fail("updateOpportunityStatus", error);
    await this.addOpportunityActivity(id, event);
  },
  async addOpportunityActivity(id, event) {
    const { error } = await db().from("opportunity_activity").insert({
      opportunity_id: id,
      happened_on: event.date,
      actor: event.actor,
      event: event.event,
      comment: event.comment ?? null,
    });
    if (error) fail("addOpportunityActivity", error);
  },
  async progressSavingsForOpportunity(opportunityId, change) {
    const update: Record<string, unknown> = { stage: change.stage };
    if (change.approverName) update.customer_approver_name = change.approverName;
    if (change.status) update.status = change.status;
    const { error } = await db()
      .from("savings_entries")
      .update(update)
      .eq("opportunity_id", opportunityId);
    if (error) fail("progressSavingsForOpportunity", error);
  },
  async completeAction(id, completedOn) {
    const { error } = await db()
      .from("actions")
      .update({ status: "done", completed_at: completedOn })
      .eq("id", id);
    if (error) fail("completeAction", error);
  },
  async markActionSupportRequested(id) {
    const { error } = await db()
      .from("actions")
      .update({ status: "support_requested" })
      .eq("id", id);
    if (error) fail("markActionSupportRequested", error);
  },
  async markAlertRead(id, userId) {
    const { error } = await db()
      .from("alert_reads")
      .upsert({ alert_id: id, user_id: userId }, { onConflict: "alert_id,user_id" });
    if (error) fail("markAlertRead", error);
  },
  async setEntitlementState(siteId, product, change) {
    const { error } = await db()
      .from("product_entitlements")
      .update({
        state: change.state,
        state_reason: change.stateReason,
        activated_at: change.activatedAt ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("site_id", siteId)
      .eq("product_slug", product);
    if (error) fail("setEntitlementState", error);
  },
  async createSupportRequest(req) {
    const { error } = await db().from("support_requests").insert({
      site_id: req.siteId,
      user_id: req.userId,
      subject: req.subject,
      message: req.message,
      status: req.status,
    });
    if (error) fail("createSupportRequest", error);
  },
  async createDocument(doc) {
    const { error } = await db().from("documents").insert({
      site_id: doc.siteId,
      category: doc.category,
      name: doc.name,
      uploaded_by_name: doc.uploadedBy,
      size_kb: doc.sizeKb,
      file_type: doc.fileType,
    });
    if (error) fail("createDocument", error);
  },
};
