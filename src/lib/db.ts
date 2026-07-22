import "server-only";
import * as seed from "@/lib/data/seed";
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
 * Demo persistence layer.
 *
 * A mutable in-memory store seeded from /lib/data/seed.ts and cached on
 * globalThis so it survives hot reloads and is shared across requests within
 * one server process. Mutations (approvals, activations, uploads) are applied
 * here through the same repository interface the production Supabase adapter
 * will implement — see /supabase/migrations for the real schema.
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
  // Deep-clone seed arrays so runtime mutations never touch module constants.
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

export function db(): Store {
  if (!g.__wattzapStore) g.__wattzapStore = createStore();
  return g.__wattzapStore;
}

// ---------- Read helpers (always tenant-scoped by siteIds) ----------

export function getSite(siteId: string): Site | undefined {
  return db().sites.find((s) => s.id === siteId);
}

export function sitesForUser(user: User): Site[] {
  if (user.allSites && user.orgId === null) return db().sites; // internal staff
  if (user.allSites) return db().sites.filter((s) => s.orgId === user.orgId);
  return db().sites.filter((s) => user.siteIds.includes(s.id));
}

export function userCanAccessSite(user: User, siteId: string): boolean {
  return sitesForUser(user).some((s) => s.id === siteId);
}

export function entitlementsForSite(siteId: string): Entitlement[] {
  return db().entitlements.filter((e) => e.siteId === siteId);
}

export function billsForSite(siteId: string): MonthlyBill[] {
  return db()
    .bills.filter((b) => b.siteId === siteId)
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function opportunitiesForSite(siteId: string): Opportunity[] {
  return db()
    .opportunities.filter((o) => o.siteId === siteId)
    .sort((a, b) => a.priority - b.priority || b.annualSaving - a.annualSaving);
}

export function savingsForSite(siteId: string): SavingsEntry[] {
  return db().savings.filter((s) => s.siteId === siteId);
}

export function actionsForSite(siteId: string): ActionItem[] {
  return db()
    .actions.filter((a) => a.siteId === siteId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function alertsForSite(siteId: string): Alert[] {
  return db()
    .alerts.filter((a) => a.siteId === siteId)
    .sort((a, b) => b.whenHappened.localeCompare(a.whenHappened));
}

export function reportsForSite(siteId: string): Report[] {
  return db()
    .reports.filter((r) => r.siteId === siteId)
    .sort((a, b) => b.generatedOn.localeCompare(a.generatedOn));
}

export function documentsForSite(siteId: string): DocumentItem[] {
  return db()
    .documents.filter((d) => d.siteId === siteId)
    .sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn));
}

export function onboardingForSite(siteId: string): OnboardingStep[] {
  return db()
    .onboarding.filter((o) => o.siteId === siteId)
    .sort((a, b) => a.step - b.step);
}

export function milestonesFor(siteId: string, product: string): OnboardingMilestone[] {
  return db()
    .milestones.filter((m) => m.siteId === siteId && m.product === product)
    .sort((a, b) => a.step - b.step);
}
