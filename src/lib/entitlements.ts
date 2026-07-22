import "server-only";
import { db, entitlementsForSite } from "@/lib/db";
import { ENTITLEMENT_RULES, JOURNEY_STAGES, PRODUCTS } from "@/lib/data/products";
import type {
  Entitlement,
  JourneyStageId,
  ProductDef,
  ProductSlug,
  ProductState,
  SavingsEntry,
  Site,
} from "@/lib/types";

/**
 * Product-entitlement service.
 *
 * Entitlement STATE lives in the database (per site, per product) — the UI
 * never decides access on its own. The configurable rules in
 * ENTITLEMENT_RULES describe what a site must have for a product to become
 * eligible; `explainUnlock` uses them to tell the customer exactly what is
 * missing, and internal tooling uses them to propose state transitions.
 */

export interface ProductWithEntitlement {
  def: ProductDef;
  entitlement: Entitlement;
}

export function productsForSite(siteId: string): ProductWithEntitlement[] {
  const ents = entitlementsForSite(siteId);
  return PRODUCTS.flatMap((def) => {
    const entitlement = ents.find((e) => e.product === def.slug);
    if (!entitlement) {
      // No stored entitlement -> locked by default, explained via rules.
      return [
        {
          def,
          entitlement: {
            id: `virtual-${siteId}-${def.slug}`,
            siteId,
            product: def.slug,
            state: "locked" as ProductState,
            stateReason: ruleDescription(def.slug),
            unlockSteps: [],
            recommendedByWattZap: false,
            updatedAt: new Date().toISOString().slice(0, 10),
          },
        },
      ];
    }
    return [{ def, entitlement }];
  });
}

export function getEntitlement(siteId: string, slug: ProductSlug): ProductWithEntitlement | null {
  const def = PRODUCTS.find((p) => p.slug === slug);
  if (!def) return null;
  const list = productsForSite(siteId);
  return list.find((p) => p.def.slug === slug) ?? null;
}

function ruleDescription(slug: ProductSlug): string {
  return (
    ENTITLEMENT_RULES.find((r) => r.product === slug)?.description ??
    "Not yet available for this site."
  );
}

/** States that mean the customer can open the module with real content. */
export const OPEN_STATES: ProductState[] = [
  "active",
  "completed",
  "onboarding",
  "trial",
  "recommended",
  "eligible",
  "preview",
];

export function isUsable(state: ProductState): boolean {
  return ["active", "completed", "trial", "onboarding"].includes(state);
}

// ---------- Journey stage aggregation ----------

export interface StageSummary {
  id: JourneyStageId;
  name: string;
  purpose: string;
  products: ProductWithEntitlement[];
  state:
    | "not_started"
    | "info_required"
    | "in_progress"
    | "opportunity"
    | "recommended"
    | "ready"
    | "active"
    | "monitoring"
    | "action_required"
    | "verified"
    | "locked";
  stateLabel: string;
  savingsIdentified: number;
  savingsVerified: number;
  nextAction: string | null;
}

const STAGE_STATE_LABELS: Record<StageSummary["state"], string> = {
  not_started: "Not started",
  info_required: "Information required",
  in_progress: "Assessment in progress",
  opportunity: "Opportunity identified",
  recommended: "Product recommended",
  ready: "Ready to activate",
  active: "Active",
  monitoring: "Monitoring",
  action_required: "Action required",
  verified: "Saving verified",
  locked: "Unlocks later",
};

export function journeyForSite(siteId: string, savings: SavingsEntry[]): StageSummary[] {
  const products = productsForSite(siteId);
  return JOURNEY_STAGES.map((stage) => {
    const stageProducts = products.filter((p) => p.def.stage === stage.id);
    const states = stageProducts.map((p) => p.entitlement.state);
    const stageSavings = savings.filter((s) =>
      stageProducts.some((p) => p.def.slug === s.product)
    );
    const savingsIdentified = stageSavings.reduce((t, s) => t + s.expectedAnnual, 0);
    const savingsVerified = stageSavings.reduce((t, s) => t + (s.verifiedAnnual ?? 0), 0);

    let state: StageSummary["state"];
    if (savingsVerified > 0) state = "verified";
    else if (states.includes("active")) state = "active";
    else if (states.includes("onboarding") || states.includes("trial")) state = "in_progress";
    else if (states.includes("completed")) state = "opportunity";
    else if (states.includes("recommended")) state = "recommended";
    else if (states.includes("eligible")) state = "ready";
    else if (states.every((s) => s === "locked")) state = "locked";
    else state = "not_started";

    const next = stageProducts.find((p) =>
      ["recommended", "eligible", "onboarding"].includes(p.entitlement.state)
    );
    return {
      id: stage.id,
      name: stage.name,
      purpose: stage.purpose,
      products: stageProducts,
      state,
      stateLabel: STAGE_STATE_LABELS[state],
      savingsIdentified,
      savingsVerified,
      nextAction: next
        ? next.entitlement.state === "onboarding"
          ? `Continue ${next.def.name} onboarding`
          : `Review ${next.def.name}`
        : null,
    };
  });
}

// ---------- Progressive navigation ----------

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/**
 * Navigation adapts to what is activated at the site — a new customer sees a
 * short menu; more products reveal more areas.
 */
export function navForSite(site: Site, isInternalUser: boolean): NavItem[] {
  const products = productsForSite(site.id);
  const has = (slug: ProductSlug, ...states: ProductState[]) =>
    products.some((p) => p.def.slug === slug && states.includes(p.entitlement.state));

  const scanDone = has("energyscan-pro", "completed", "active");
  const anyGuard = ["pf-guard", "demand-guard", "bill-guard", "solar-guard"].some((s) =>
    products.some(
      (p) => p.def.slug === (s as ProductSlug) && ["active", "onboarding", "trial"].includes(p.entitlement.state)
    )
  );

  const items: NavItem[] = [{ href: "/", label: "Home", icon: "home" }];

  if (scanDone) items.push({ href: "/journey", label: "Savings Journey", icon: "map" });
  items.push({ href: "/sites", label: "Sites", icon: "factory" });
  if (!scanDone) items.push({ href: "/products/energyscan-lite", label: "EnergyScan", icon: "search" });
  if (scanDone) items.push({ href: "/opportunities", label: "Opportunities", icon: "lightbulb" });
  if (scanDone || anyGuard) items.push({ href: "/alerts", label: "Alerts", icon: "bell" });
  if (scanDone) items.push({ href: "/savings", label: "Savings", icon: "wallet" });
  if (scanDone) items.push({ href: "/reports", label: "Reports", icon: "file-text" });
  items.push({ href: "/documents", label: "Documents", icon: "folder" });
  items.push({ href: "/support", label: "Support", icon: "life-buoy" });
  items.push({ href: "/settings", label: "Settings", icon: "settings" });
  if (isInternalUser) items.push({ href: "/internal", label: "WattZap Console", icon: "briefcase" });
  return items;
}
