import "server-only";
import type { SavingsEntry, SavingsStage } from "@/lib/types";

/** Savings Wallet aggregation — the Identified → Verified value flow. */

export const STAGE_ORDER: SavingsStage[] = [
  "identified",
  "approved",
  "implemented",
  "measured",
  "verified",
];

export const STAGE_LABELS: Record<SavingsStage, string> = {
  identified: "Identified",
  approved: "Approved",
  implemented: "Implemented",
  measured: "Measured",
  verified: "Verified",
};

export interface WalletSummary {
  /** All value found (₹/year, estimated) */
  identified: number;
  /** Value the customer has approved (reached approved or beyond) */
  approved: number;
  /** Value implemented on site (reached implemented or beyond) */
  implemented: number;
  /** Value verified by measurement */
  verified: number;
  /** Value still waiting on a customer decision */
  pendingAction: number;
  /** Rough monthly at-risk figure from unaddressed items */
  monthlyAtRisk: number;
}

function reached(entry: SavingsEntry, stage: SavingsStage): boolean {
  return STAGE_ORDER.indexOf(entry.stage) >= STAGE_ORDER.indexOf(stage);
}

export function walletSummary(entries: SavingsEntry[]): WalletSummary {
  const sum = (xs: SavingsEntry[], f: (e: SavingsEntry) => number) =>
    xs.reduce((t, e) => t + f(e), 0);
  const identified = sum(entries, (e) => e.expectedAnnual);
  const approved = sum(entries.filter((e) => reached(e, "approved")), (e) => e.expectedAnnual);
  const implemented = sum(entries.filter((e) => reached(e, "implemented")), (e) => e.expectedAnnual);
  const verified = sum(entries, (e) => e.verifiedAnnual ?? 0);
  const pending = entries.filter((e) => e.stage === "identified");
  const pendingAction = sum(pending, (e) => e.expectedAnnual);
  // Money at risk: monthly value of savings not yet implemented.
  const notImplemented = entries.filter((e) => !reached(e, "implemented"));
  const monthlyAtRisk = sum(notImplemented, (e) => e.monthlyExpected);
  return { identified, approved, implemented, verified, pendingAction, monthlyAtRisk };
}

export function byProduct(entries: SavingsEntry[]): { product: string; expected: number; verified: number }[] {
  const map = new Map<string, { expected: number; verified: number }>();
  for (const e of entries) {
    const cur = map.get(e.product) ?? { expected: 0, verified: 0 };
    cur.expected += e.expectedAnnual;
    cur.verified += e.verifiedAnnual ?? 0;
    map.set(e.product, cur);
  }
  return Array.from(map, ([product, v]) => ({ product, ...v }));
}
