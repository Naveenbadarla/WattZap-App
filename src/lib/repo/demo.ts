import "server-only";
import * as seed from "@/lib/data/seed";
import type { Repository } from "@/lib/repo/types";
import type {
  ActionItem,
  Alert,
  DemandEvent,
  DocumentItem,
  Entitlement,
  Equipment,
  MonthlyBill,
  OnboardingMilestone,
  OnboardingStep,
  Opportunity,
  Organisation,
  PFEvent,
  Report,
  SavingsEntry,
  Session,
  Site,
  SupportRequest,
  TodProfilePoint,
  User,
} from "@/lib/types";

/**
 * Demo adapter: mutable in-memory store seeded from /lib/data/seed.ts and
 * cached on globalThis. Used whenever Supabase env vars are absent. Mutations
 * persist for the life of the server process, then reset — ideal for demos.
 */

export interface Store {
  org: Organisation;
  sites: Site[];
  users: User[];
  entitlements: Entitlement[];
  bills: MonthlyBill[];
  demandEvents: DemandEvent[];
  pfEvents: PFEvent[];
  todProfile: TodProfilePoint[];
  opportunities: Opportunity[];
  savings: SavingsEntry[];
  actions: ActionItem[];
  alerts: Alert[];
  reports: Report[];
  documents: DocumentItem[];
  onboarding: OnboardingStep[];
  milestones: OnboardingMilestone[];
  equipment: Equipment[];
  supportRequests: SupportRequest[];
  sessions: Map<string, Session>;
}

function createStore(): Store {
  const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
  return {
    org: clone(seed.ORG),
    sites: clone(seed.SITES),
    users: clone(seed.USERS),
    entitlements: clone(seed.ENTITLEMENTS),
    bills: clone(seed.BILLS),
    demandEvents: clone(seed.DEMAND_EVENTS),
    pfEvents: clone(seed.PF_EVENTS),
    todProfile: clone(seed.TOD_PROFILE),
    opportunities: clone(seed.OPPORTUNITIES),
    savings: clone(seed.SAVINGS),
    actions: clone(seed.ACTIONS),
    alerts: clone(seed.ALERTS),
    reports: clone(seed.REPORTS),
    documents: clone(seed.DOCUMENTS),
    onboarding: clone(seed.ONBOARDING),
    milestones: clone(seed.MILESTONES),
    equipment: clone(seed.EQUIPMENT),
    supportRequests: clone(seed.SUPPORT_REQUESTS),
    sessions: new Map(),
  };
}

const g = globalThis as unknown as { __wattzapStore?: Store };

/** Exposed for the demo auth adapter (sessions live in the same store). */
export function demoStore(): Store {
  if (!g.__wattzapStore) g.__wattzapStore = createStore();
  return g.__wattzapStore;
}

function sitesForUserSync(user: User): Site[] {
  const s = demoStore();
  if (user.allSites && user.orgId === null) return s.sites; // WattZap staff
  if (user.allSites) return s.sites.filter((x) => x.orgId === user.orgId);
  return s.sites.filter((x) => user.siteIds.includes(x.id));
}

export const demoRepo: Repository = {
  async getUserByEmail(email) {
    return (
      demoStore().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null
    );
  },
  async getUserById(id) {
    return demoStore().users.find((u) => u.id === id) ?? null;
  },
  async listOrgUsers(orgId) {
    return demoStore().users.filter((u) => u.orgId === orgId);
  },
  async getOrgName(orgId) {
    const s = demoStore();
    return orgId === null || s.org.id === orgId ? s.org.name : "Unknown organisation";
  },
  async getSite(siteId) {
    return demoStore().sites.find((s) => s.id === siteId) ?? null;
  },
  async sitesForUser(user) {
    return sitesForUserSync(user);
  },
  async listAllSites() {
    return demoStore().sites;
  },

  async entitlementsForSite(siteId) {
    return demoStore().entitlements.filter((e) => e.siteId === siteId);
  },
  async billsForSite(siteId) {
    return demoStore()
      .bills.filter((b) => b.siteId === siteId)
      .sort((a, b) => a.month.localeCompare(b.month));
  },
  async opportunitiesForSite(siteId) {
    return demoStore()
      .opportunities.filter((o) => o.siteId === siteId)
      .sort((a, b) => a.priority - b.priority || b.annualSaving - a.annualSaving);
  },
  async getOpportunity(id) {
    return demoStore().opportunities.find((o) => o.id === id) ?? null;
  },
  async savingsForSite(siteId) {
    return demoStore().savings.filter((s) => s.siteId === siteId);
  },
  async getSavingsEntry(id) {
    return demoStore().savings.find((s) => s.id === id) ?? null;
  },
  async findSavingsByOpportunity(opportunityId) {
    return demoStore().savings.find((s) => s.opportunityId === opportunityId) ?? null;
  },
  async actionsForSite(siteId) {
    return demoStore()
      .actions.filter((a) => a.siteId === siteId)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },
  async getAction(id) {
    return demoStore().actions.find((a) => a.id === id) ?? null;
  },
  async alertsForSite(siteId, _userId) {
    return demoStore()
      .alerts.filter((a) => a.siteId === siteId)
      .sort((a, b) => b.whenHappened.localeCompare(a.whenHappened));
  },
  async getAlert(id) {
    return demoStore().alerts.find((a) => a.id === id) ?? null;
  },
  async reportsForSite(siteId) {
    return demoStore()
      .reports.filter((r) => r.siteId === siteId)
      .sort((a, b) => b.generatedOn.localeCompare(a.generatedOn));
  },
  async documentsForSite(siteId) {
    return demoStore()
      .documents.filter((d) => d.siteId === siteId)
      .sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn));
  },
  async onboardingForSite(siteId) {
    return demoStore()
      .onboarding.filter((o) => o.siteId === siteId)
      .sort((a, b) => a.step - b.step);
  },
  async milestonesFor(siteId, product) {
    return demoStore()
      .milestones.filter((m) => m.siteId === siteId && m.product === product)
      .sort((a, b) => a.step - b.step);
  },
  async pfEventsForSite(siteId) {
    return demoStore().pfEvents.filter((e) => e.siteId === siteId);
  },
  async demandEventsForSite(siteId) {
    return demoStore().demandEvents.filter((e) => e.siteId === siteId);
  },
  async todProfileForSite(siteId) {
    // Demo dataset only carries a profile for the rice mill.
    return siteId === "site-ricemill" ? demoStore().todProfile : [];
  },
  async supportRequestsForSite(siteId) {
    return demoStore()
      .supportRequests.filter((r) => r.siteId === siteId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async updateOpportunityStatus(id, status, event) {
    const opp = demoStore().opportunities.find((o) => o.id === id);
    if (!opp) throw new Error("Opportunity not found");
    opp.status = status;
    opp.activity.push(event);
  },
  async addOpportunityActivity(id, event) {
    const opp = demoStore().opportunities.find((o) => o.id === id);
    if (!opp) throw new Error("Opportunity not found");
    opp.activity.push(event);
  },
  async progressSavingsForOpportunity(opportunityId, change) {
    const sav = demoStore().savings.find((s) => s.opportunityId === opportunityId);
    if (!sav) return;
    sav.stage = change.stage;
    if (change.approverName) sav.customerApprover = change.approverName;
    if (change.status) sav.status = change.status;
    sav.updatedAt = new Date().toISOString().slice(0, 10);
  },
  async completeAction(id, completedOn) {
    const item = demoStore().actions.find((a) => a.id === id);
    if (!item) throw new Error("Action not found");
    item.status = "done";
    item.completedAt = completedOn;
  },
  async markActionSupportRequested(id) {
    const item = demoStore().actions.find((a) => a.id === id);
    if (!item) throw new Error("Action not found");
    item.status = "support_requested";
  },
  async markAlertRead(id, _userId) {
    const alert = demoStore().alerts.find((a) => a.id === id);
    if (!alert) throw new Error("Alert not found");
    alert.read = true;
  },
  async setEntitlementState(siteId, product, change) {
    const ent = demoStore().entitlements.find(
      (e) => e.siteId === siteId && e.product === product
    );
    if (!ent) throw new Error("Product not available for this site");
    ent.state = change.state;
    ent.stateReason = change.stateReason;
    if (change.activatedAt) ent.activatedAt = change.activatedAt;
    ent.updatedAt = new Date().toISOString().slice(0, 10);
  },
  async createSupportRequest(req) {
    demoStore().supportRequests.push({ ...req, id: `sr-${Date.now()}` });
  },
  async createDocument(doc) {
    demoStore().documents.unshift({ ...doc, id: `doc-${Date.now()}` });
  },
};
