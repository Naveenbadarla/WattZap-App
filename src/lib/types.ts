/**
 * WattZap domain types.
 *
 * These mirror the relational schema in /supabase/migrations and are the
 * single source of truth for the in-app demo data layer.
 */

// ---------- Core enums ----------

export type Role =
  | "owner"
  | "plant_manager"
  | "finance"
  | "maintenance"
  | "wattzap_internal";

export type InternalRole =
  | "admin"
  | "energy_analyst"
  | "solar_engineer"
  | "customer_success"
  | "finance_reviewer"
  | "field_technician"
  | "savings_verifier";

export type ProductSlug =
  | "energyscan-lite"
  | "energyscan-pro"
  | "pf-guard"
  | "demand-guard"
  | "bill-guard"
  | "solar-guard"
  | "ems-lite"
  | "wattzap-edge"
  | "solarfit"
  | "solarlease"
  | "savings-assurance";

export type JourneyStageId =
  | "diagnose"
  | "protect"
  | "optimise"
  | "generate"
  | "finance"
  | "prove";

export type ProductState =
  | "locked"
  | "preview"
  | "eligible"
  | "recommended"
  | "trial"
  | "onboarding"
  | "active"
  | "completed"
  | "suspended"
  | "expired"
  | "cancelled";

export type DataReadiness =
  | "no_data"
  | "bill_data"
  | "historical_interval"
  | "monthly_manual"
  | "live_meter"
  | "live_equipment"
  | "control_enabled"
  | "verification_enabled";

/** Every displayed number carries one of these provenance tags. */
export type DataTag =
  | "historical"
  | "uploaded"
  | "estimated"
  | "simulated"
  | "live"
  | "verified";

export type SiteHealth = "good" | "needs_attention" | "critical";

export type MaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// ---------- Organisation / sites / users ----------

export interface Organisation {
  id: string;
  name: string;
  gstin?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  orgId: string;
  name: string;
  shortName: string;
  industry: string;
  location: string;
  state: string;
  connectionType: string; // e.g. "HT 11 kV"
  discom: string;
  sanctionedDemandKva: number;
  contractDemandKva: number;
  connectedLoadKw: number;
  operatingHours: string;
  monthlyProductionTonnes?: number;
  productionUnit?: string;
  solarInstalledKw: number;
  roofAreaSqft?: number;
  dataReadiness: DataReadiness;
  maturityLevel: MaturityLevel;
  health: SiteHealth;
  healthReason: string;
  createdAt: string;
}

export interface User {
  id: string;
  orgId: string | null; // null for WattZap internal staff
  name: string;
  email: string;
  /** Demo only — plaintext. Production uses Supabase Auth (see migrations). */
  password: string;
  role: Role;
  internalRole?: InternalRole;
  phone?: string;
  siteIds: string[]; // sites the user can access ("*" handled via allSites)
  allSites?: boolean;
}

// ---------- Products & entitlements ----------

export interface ProductDef {
  slug: ProductSlug;
  name: string;
  stage: JourneyStageId;
  tagline: string; // plain-language purpose
  description: string;
  whatItDoes: string[];
  commercialModel: string;
  icon: string; // lucide icon name key, mapped in UI
}

export interface Entitlement {
  id: string;
  siteId: string;
  product: ProductSlug;
  state: ProductState;
  /** Plain-language reason for the current state (esp. locked/eligible). */
  stateReason: string;
  /** What the customer must do to unlock/progress. */
  unlockSteps: string[];
  /** Expected value if activated, in ₹/year (estimated). */
  estimatedAnnualValue?: number;
  recommendedByWattZap: boolean;
  activatedAt?: string;
  updatedAt: string;
}

/** Configurable unlocking rule — evaluated server-side. */
export interface EntitlementRule {
  product: ProductSlug;
  requiresReadiness: DataReadiness[];
  requiresProducts?: ProductSlug[];
  requiresFlags?: string[]; // site facts, e.g. "has_solar", "has_roof_data"
  description: string;
}

export interface OnboardingMilestone {
  id: string;
  siteId: string;
  product: ProductSlug;
  step: number;
  title: string;
  status: "done" | "in_progress" | "pending";
  date?: string;
  note?: string;
}

// ---------- Energy data ----------

export interface MonthlyBill {
  id: string;
  siteId: string;
  month: string; // "2026-03"
  billNumber: string;
  amount: number;
  unitsKwh: number;
  recordedMdKva: number;
  billedMdKva: number;
  powerFactor: number;
  pfPenalty: number;
  mdPenalty: number;
  todPeakUnits: number;
  todNormalUnits: number;
  todOffpeakUnits: number;
  anomalies: string[];
  status: "analysed" | "uploaded" | "flagged" | "pending";
  dataTag: DataTag;
}

export interface DemandEvent {
  id: string;
  siteId: string;
  date: string;
  time: string;
  peakKva: number;
  thresholdKva: number;
  durationMin: number;
  likelyCause: string;
  estimatedCost: number;
  dataTag: DataTag;
}

export interface PFEvent {
  id: string;
  siteId: string;
  month: string;
  avgPf: number;
  worstPf: number;
  worstWindow: string;
  penalty: number;
  likelyCause: string;
  dataTag: DataTag;
}

export interface TodProfilePoint {
  hour: string; // "06:00"
  kva: number;
  kwh: number;
}

// ---------- Opportunities, actions, savings ----------

export type OpportunityStatus =
  | "new"
  | "under_review"
  | "info_required"
  | "recommended"
  | "approved"
  | "rejected"
  | "planned"
  | "in_progress"
  | "implemented"
  | "measuring"
  | "verified"
  | "closed";

export type Confidence = "high" | "medium" | "low";
export type Complexity = "low" | "medium" | "high";

export interface Opportunity {
  id: string;
  siteId: string;
  title: string;
  plainExplanation: string;
  whatHappened: string;
  whyItMatters: string;
  technicalDetail: string;
  annualSaving: number;
  implementationCost: number;
  paybackMonths: number | null;
  confidence: Confidence;
  complexity: Complexity;
  priority: 1 | 2 | 3;
  product: ProductSlug;
  requiredAction: string;
  decisionOwnerRole: Role;
  status: OpportunityStatus;
  evidence: string[];
  identifiedOn: string;
  dataTag: DataTag;
  activity: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  date: string;
  actor: string;
  event: string;
  comment?: string;
}

export type SavingsStage =
  | "identified"
  | "approved"
  | "implemented"
  | "measured"
  | "verified";

export interface SavingsEntry {
  id: string;
  siteId: string;
  opportunityId?: string;
  title: string;
  product: ProductSlug;
  stage: SavingsStage;
  /** ₹/year expected */
  expectedAnnual: number;
  /** ₹/year verified (only when stage === verified/measured) */
  verifiedAnnual?: number;
  monthlyExpected: number;
  monthlyVerified?: number;
  baseline: string;
  measurementPeriod?: string;
  method: string;
  adjustments?: string;
  varianceReason?: string;
  confidence: Confidence;
  evidence: string[];
  wattzapReviewer?: string;
  customerApprover?: string;
  status: string;
  dataTag: DataTag;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  siteId: string;
  opportunityId?: string;
  title: string;
  detail: string;
  monthlyValue: number;
  difficulty: Complexity;
  assigneeRole: Role;
  assigneeName: string;
  dueDate: string;
  status: "open" | "done" | "support_requested";
  completedAt?: string;
}

// ---------- Alerts ----------

export type AlertCategory =
  | "critical"
  | "action_required"
  | "opportunity"
  | "information"
  | "data_issue"
  | "product_recommendation";

export interface Alert {
  id: string;
  siteId: string;
  category: AlertCategory;
  title: string;
  whatHappened: string;
  whenHappened: string;
  financialImpact: number | null;
  whyItMatters: string;
  recommendedAction: string;
  deadline?: string;
  responsibleRole: Role;
  product: ProductSlug;
  evidence: string;
  read: boolean;
  dataTag: DataTag;
}

// ---------- Reports & documents ----------

export interface Report {
  id: string;
  siteId: string;
  type: string;
  title: string;
  period: string;
  generatedOn: string;
  version: string;
  status: "final" | "draft" | "in_review" | "generating";
  approvedBy?: string;
  reviewer?: string;
  summary: string;
  dataTag: DataTag;
}

export type DocumentCategory =
  | "electricity_bill"
  | "meter_file"
  | "site_photo"
  | "equipment"
  | "solar"
  | "quotation"
  | "agreement"
  | "verification_evidence"
  | "invoice"
  | "compliance";

export interface DocumentItem {
  id: string;
  siteId: string;
  category: DocumentCategory;
  name: string;
  uploadedBy: string;
  uploadedOn: string;
  sizeKb: number;
  fileType: "pdf" | "image" | "xlsx" | "csv";
}

// ---------- Onboarding & support ----------

export interface OnboardingStep {
  id: string;
  siteId: string;
  step: number;
  title: string;
  description: string;
  status: "done" | "in_progress" | "pending";
  valueMessage?: string; // immediate value shown after completion
}

export interface SupportRequest {
  id: string;
  siteId: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

export interface Equipment {
  id: string;
  siteId: string;
  name: string;
  category: string;
  ratedKw: number;
  notes?: string;
}

// ---------- Sessions (demo auth) ----------

export interface Session {
  token: string;
  userId: string;
  activeSiteId: string;
  createdAt: string;
}

export interface NotificationPrefs {
  userId: string;
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  language: "en" | "en-simple";
}
