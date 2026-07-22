#!/usr/bin/env node
/**
 * Seeds a Supabase project with the WattZap demo dataset (Venkata Sai Rice
 * Mill + Cold Storage), creating the five demo auth users.
 *
 * Usage:
 *   1. Run supabase/migrations/0001_init.sql and 0002_adapter_support.sql
 *      in the Supabase SQL editor (in order).
 *   2. NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *        npm run seed:supabase
 *
 * Idempotent: rows use deterministic UUIDs derived from the seed ids, and all
 * inserts are upserts — re-running refreshes the data in place.
 *
 * Requires Node 22.18+ (imports the TypeScript seed module via the built-in
 * type-stripping loader; src/lib/data/seed.ts has type-only imports only).
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import * as seed from "../src/lib/data/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running."
  );
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

/** Deterministic UUID (v5-style, SHA-1 based) from a seed text id. */
function uid(name) {
  const h = createHash("sha1").update(`wattzap:${name}`).digest("hex");
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    "5" + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join("-");
}

async function upsert(table, rows, onConflict = "id") {
  if (rows.length === 0) return;
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) {
    console.error(`✗ ${table}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ ${table} (${rows.length})`);
}

// ---------- organisation & sites ----------

const orgId = uid(seed.ORG.id);
await upsert("organisations", [
  { id: orgId, name: seed.ORG.name, gstin: seed.ORG.gstin ?? null },
]);

await upsert(
  "sites",
  seed.SITES.map((s) => ({
    id: uid(s.id),
    org_id: orgId,
    name: s.name,
    short_name: s.shortName,
    industry: s.industry,
    location: s.location,
    state: s.state,
    connection_type: s.connectionType,
    discom: s.discom,
    sanctioned_demand_kva: s.sanctionedDemandKva,
    contract_demand_kva: s.contractDemandKva,
    connected_load_kw: s.connectedLoadKw,
    operating_hours: s.operatingHours,
    monthly_production: s.monthlyProductionTonnes ?? null,
    production_unit: s.productionUnit ?? null,
    solar_installed_kw: s.solarInstalledKw,
    roof_area_sqft: s.roofAreaSqft ?? null,
    data_readiness: s.dataReadiness,
    maturity_level: s.maturityLevel,
    health: s.health,
    health_reason: s.healthReason,
  }))
);

// ---------- auth users + profiles + memberships ----------

const userIdMap = new Map(); // seed user id -> auth uuid

for (const u of seed.USERS) {
  let authId;
  const { data: created, error } = await db.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name },
  });
  if (error) {
    // Already exists — find them.
    const { data: list, error: listErr } = await db.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listErr) {
      console.error(`✗ auth lookup for ${u.email}: ${listErr.message}`);
      process.exit(1);
    }
    const existing = list.users.find(
      (x) => x.email?.toLowerCase() === u.email.toLowerCase()
    );
    if (!existing) {
      console.error(`✗ auth user ${u.email}: ${error.message}`);
      process.exit(1);
    }
    authId = existing.id;
  } else {
    authId = created.user.id;
  }
  userIdMap.set(u.id, authId);

  await upsert("profiles", [
    {
      id: authId,
      org_id: u.orgId ? orgId : null,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      role: u.role,
      internal_role: u.internalRole ?? null,
    },
  ]);
  if (u.role === "wattzap_internal") {
    await upsert("wattzap_staff", [
      { user_id: authId, internal_role: u.internalRole ?? "energy_analyst" },
    ], "user_id");
  }
  await upsert(
    "site_memberships",
    u.siteIds.map((siteId) => ({
      id: uid(`membership:${u.id}:${siteId}`),
      user_id: authId,
      site_id: uid(siteId),
    }))
  );
  console.log(`✓ user ${u.email}`);
}

// ---------- entitlements & milestones ----------

await upsert(
  "product_entitlements",
  seed.ENTITLEMENTS.map((e) => ({
    id: uid(e.id),
    site_id: uid(e.siteId),
    product_slug: e.product,
    state: e.state,
    state_reason: e.stateReason,
    unlock_steps: e.unlockSteps,
    estimated_annual_value: e.estimatedAnnualValue ?? null,
    recommended: e.recommendedByWattZap,
    activated_at: e.activatedAt ?? null,
  }))
);

await upsert(
  "product_milestones",
  seed.MILESTONES.map((m) => ({
    id: uid(m.id),
    site_id: uid(m.siteId),
    product_slug: m.product,
    step: m.step,
    title: m.title,
    status: m.status,
    happened_on: m.date ?? null,
    note: m.note ?? null,
  }))
);

// ---------- energy data ----------

await upsert(
  "electricity_bills",
  seed.BILLS.map((b) => ({
    id: uid(b.id),
    site_id: uid(b.siteId),
    month: b.month,
    bill_number: b.billNumber,
    amount: b.amount,
    units_kwh: b.unitsKwh,
    recorded_md_kva: b.recordedMdKva,
    billed_md_kva: b.billedMdKva,
    power_factor: b.powerFactor,
    pf_penalty: b.pfPenalty,
    md_penalty: b.mdPenalty,
    tod_peak_units: b.todPeakUnits,
    tod_normal_units: b.todNormalUnits,
    tod_offpeak_units: b.todOffpeakUnits,
    anomalies: b.anomalies,
    status: b.status,
    tag: b.dataTag,
  }))
);

await upsert(
  "demand_records",
  seed.DEMAND_EVENTS.map((d) => ({
    id: uid(d.id),
    site_id: uid(d.siteId),
    happened_on: d.date,
    happened_at: d.time,
    peak_kva: d.peakKva,
    threshold_kva: d.thresholdKva,
    duration_min: d.durationMin,
    likely_cause: d.likelyCause,
    estimated_cost: d.estimatedCost,
    tag: d.dataTag,
  }))
);

await upsert(
  "power_factor_records",
  seed.PF_EVENTS.map((p) => ({
    id: uid(p.id),
    site_id: uid(p.siteId),
    month: p.month,
    avg_pf: p.avgPf,
    worst_pf: p.worstPf,
    worst_window: p.worstWindow,
    penalty: p.penalty,
    likely_cause: p.likelyCause,
    tag: p.dataTag,
  }))
);

await upsert(
  "tod_profile_points",
  seed.TOD_PROFILE.map((t) => ({
    id: uid(`tod:site-ricemill:${t.hour}`),
    site_id: uid("site-ricemill"),
    hour: t.hour,
    kva: t.kva,
    kwh: t.kwh,
  }))
);

// ---------- opportunities, savings, actions ----------

await upsert(
  "opportunities",
  seed.OPPORTUNITIES.map((o) => ({
    id: uid(o.id),
    site_id: uid(o.siteId),
    title: o.title,
    plain_explanation: o.plainExplanation,
    what_happened: o.whatHappened,
    why_it_matters: o.whyItMatters,
    technical_detail: o.technicalDetail,
    annual_saving: o.annualSaving,
    implementation_cost: o.implementationCost,
    payback_months: o.paybackMonths,
    confidence: o.confidence,
    complexity: o.complexity,
    priority: o.priority,
    product_slug: o.product,
    required_action: o.requiredAction,
    decision_owner_role: o.decisionOwnerRole,
    status: o.status,
    evidence: o.evidence,
    identified_on: o.identifiedOn,
    tag: o.dataTag,
  }))
);

await upsert(
  "opportunity_activity",
  seed.OPPORTUNITIES.flatMap((o) =>
    o.activity.map((a, i) => ({
      id: uid(`act:${o.id}:${i}`),
      opportunity_id: uid(o.id),
      happened_on: a.date,
      actor: a.actor,
      event: a.event,
      comment: a.comment ?? null,
    }))
  )
);

await upsert(
  "savings_entries",
  seed.SAVINGS.map((s) => ({
    id: uid(s.id),
    site_id: uid(s.siteId),
    opportunity_id: s.opportunityId ? uid(s.opportunityId) : null,
    title: s.title,
    product_slug: s.product,
    stage: s.stage,
    expected_annual: s.expectedAnnual,
    verified_annual: s.verifiedAnnual ?? null,
    monthly_expected: s.monthlyExpected,
    monthly_verified: s.monthlyVerified ?? null,
    baseline_note: s.baseline,
    measurement_period: s.measurementPeriod ?? null,
    method: s.method,
    adjustments: s.adjustments ?? null,
    variance_reason: s.varianceReason ?? null,
    confidence: s.confidence,
    evidence: s.evidence,
    wattzap_reviewer_name: s.wattzapReviewer ?? null,
    customer_approver_name: s.customerApprover ?? null,
    status: s.status,
    tag: s.dataTag,
  }))
);

await upsert(
  "actions",
  seed.ACTIONS.map((a) => ({
    id: uid(a.id),
    site_id: uid(a.siteId),
    opportunity_id: a.opportunityId ? uid(a.opportunityId) : null,
    title: a.title,
    detail: a.detail,
    monthly_value: a.monthlyValue,
    difficulty: a.difficulty,
    assignee_role: a.assigneeRole,
    assignee_name: a.assigneeName,
    due_date: a.dueDate,
    status: a.status,
    completed_at: a.completedAt ?? null,
  }))
);

// ---------- alerts, reports, documents, onboarding, support ----------

await upsert(
  "alerts",
  seed.ALERTS.map((a) => ({
    id: uid(a.id),
    site_id: uid(a.siteId),
    category: a.category,
    title: a.title,
    what_happened: a.whatHappened,
    happened_at: a.whenHappened.includes(":")
      ? a.whenHappened.replace(" ", "T") + ":00+05:30"
      : a.whenHappened + "T09:00:00+05:30",
    financial_impact: a.financialImpact,
    why_it_matters: a.whyItMatters,
    recommended_action: a.recommendedAction,
    deadline: a.deadline ?? null,
    responsible_role: a.responsibleRole,
    product_slug: a.product,
    evidence: a.evidence,
    tag: a.dataTag,
  }))
);

await upsert(
  "reports",
  seed.REPORTS.map((r) => ({
    id: uid(r.id),
    site_id: uid(r.siteId),
    report_type: r.type,
    title: r.title,
    period: r.period,
    version: r.version,
    status: r.status,
    summary: r.summary,
    reviewer_name: r.reviewer ?? null,
    approved_by_name: r.approvedBy ?? null,
    tag: r.dataTag,
    generated_on: r.generatedOn,
  }))
);

await upsert(
  "documents",
  seed.DOCUMENTS.map((d) => ({
    id: uid(d.id),
    site_id: uid(d.siteId),
    category: d.category,
    name: d.name,
    uploaded_by_name: d.uploadedBy,
    size_kb: d.sizeKb,
    file_type: d.fileType,
  }))
);

await upsert(
  "onboarding_steps",
  seed.ONBOARDING.map((o) => ({
    id: uid(o.id),
    site_id: uid(o.siteId),
    step: o.step,
    title: o.title,
    description: o.description,
    status: o.status,
    value_message: o.valueMessage ?? null,
  }))
);

await upsert(
  "support_requests",
  seed.SUPPORT_REQUESTS.map((r) => ({
    id: uid(r.id),
    site_id: uid(r.siteId),
    user_id: userIdMap.get(r.userId),
    subject: r.subject,
    message: r.message,
    status: r.status,
  }))
);

console.log("\nDone. Sign in with owner@venkatasai.in / demo1234 (see README for all accounts).");
