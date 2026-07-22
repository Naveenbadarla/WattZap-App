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
  OpportunityStatus,
  PFEvent,
  ProductSlug,
  ProductState,
  Report,
  SavingsEntry,
  SavingsStage,
  Site,
  SupportRequest,
  TodProfilePoint,
  User,
} from "@/lib/types";

/**
 * Repository contract — the single seam between the application and its
 * persistence backend. Two implementations exist:
 *
 *   repo/demo.ts     — in-memory seeded store (no env vars needed)
 *   repo/supabase.ts — Supabase/PostgreSQL (enabled when env vars are set)
 *
 * All methods are async so the two are interchangeable. Authorisation is NOT
 * done here — server actions check session, tenant and role before calling
 * any write method.
 */
export interface Repository {
  // ---- users & tenancy ----
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  listOrgUsers(orgId: string): Promise<User[]>;
  getOrgName(orgId: string | null): Promise<string>;
  getSite(siteId: string): Promise<Site | null>;
  sitesForUser(user: User): Promise<Site[]>;
  listAllSites(): Promise<Site[]>;

  // ---- reads (site-scoped) ----
  entitlementsForSite(siteId: string): Promise<Entitlement[]>;
  billsForSite(siteId: string): Promise<MonthlyBill[]>;
  opportunitiesForSite(siteId: string): Promise<Opportunity[]>;
  getOpportunity(id: string): Promise<Opportunity | null>;
  savingsForSite(siteId: string): Promise<SavingsEntry[]>;
  getSavingsEntry(id: string): Promise<SavingsEntry | null>;
  findSavingsByOpportunity(opportunityId: string): Promise<SavingsEntry | null>;
  actionsForSite(siteId: string): Promise<ActionItem[]>;
  getAction(id: string): Promise<ActionItem | null>;
  alertsForSite(siteId: string, userId: string): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | null>;
  reportsForSite(siteId: string): Promise<Report[]>;
  documentsForSite(siteId: string): Promise<DocumentItem[]>;
  onboardingForSite(siteId: string): Promise<OnboardingStep[]>;
  milestonesFor(siteId: string, product: ProductSlug): Promise<OnboardingMilestone[]>;
  pfEventsForSite(siteId: string): Promise<PFEvent[]>;
  demandEventsForSite(siteId: string): Promise<DemandEvent[]>;
  todProfileForSite(siteId: string): Promise<TodProfilePoint[]>;
  supportRequestsForSite(siteId: string): Promise<SupportRequest[]>;

  // ---- writes (called only after auth/tenant/role checks) ----
  updateOpportunityStatus(
    id: string,
    status: OpportunityStatus,
    event: ActivityEvent
  ): Promise<void>;
  addOpportunityActivity(id: string, event: ActivityEvent): Promise<void>;
  progressSavingsForOpportunity(
    opportunityId: string,
    change: { stage: SavingsStage; approverName?: string; status?: string }
  ): Promise<void>;
  completeAction(id: string, completedOn: string): Promise<void>;
  markActionSupportRequested(id: string): Promise<void>;
  markAlertRead(id: string, userId: string): Promise<void>;
  setEntitlementState(
    siteId: string,
    product: ProductSlug,
    change: { state: ProductState; stateReason: string; activatedAt?: string }
  ): Promise<void>;
  createSupportRequest(req: Omit<SupportRequest, "id">): Promise<void>;
  createDocument(doc: Omit<DocumentItem, "id">): Promise<void>;
}
