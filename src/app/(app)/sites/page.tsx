import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import {
  billsForSite,
  entitlementsForSite,
  savingsForSite,
  sitesForUser,
} from "@/lib/db";
import { walletSummary } from "@/lib/savings";
import { formatINR, formatINRFull } from "@/lib/format";
import { Card, DataTagBadge, HealthBadge, PageHeader } from "@/components/ui";
import { MATURITY_LEVELS, PRODUCTS } from "@/lib/data/products";

export const metadata: Metadata = { title: "Sites" };

export default async function SitesPage() {
  const { user } = await requireUser();
  const sites = await sitesForUser(user);

  const rows = await Promise.all(
    sites.map(async (site) => {
      const [bills, savings, ents] = await Promise.all([
        billsForSite(site.id),
        savingsForSite(site.id),
        entitlementsForSite(site.id),
      ]);
      const latest = bills[bills.length - 1];
      const wallet = walletSummary(savings);
      const active = ents.filter((e) => ["active", "onboarding", "completed"].includes(e.state));
      const perTonne =
        latest && site.monthlyProductionTonnes
          ? latest.unitsKwh / site.monthlyProductionTonnes
          : null;
      return { site, latest, wallet, active, perTonne };
    })
  );

  const totalCost = rows.reduce((t, r) => t + (r.latest?.amount ?? 0), 0);
  const totalVerified = rows.reduce((t, r) => t + r.wallet.verified, 0);
  const totalRisk = rows.reduce((t, r) => t + r.wallet.monthlyAtRisk, 0);

  // Simple production-normalised comparison when 2+ sites have data.
  const comparable = rows.filter((r) => r.perTonne !== null);
  let comparison: string | null = null;
  if (comparable.length >= 2) {
    const sorted = [...comparable].sort((a, b) => (a.perTonne! - b.perTonne!));
    const bestR = sorted[0];
    const worstR = sorted[sorted.length - 1];
    const diff = ((worstR.perTonne! - bestR.perTonne!) / bestR.perTonne!) * 100;
    comparison = `${worstR.site.shortName} uses ${diff.toFixed(0)}% more electricity per ${worstR.site.productionUnit?.split(" ")[0] ?? "tonne"} of production than ${bestR.site.shortName}. (Different industries — treat as indicative.)`;
  }

  return (
    <div>
      <PageHeader
        title="Your sites"
        subtitle="Portfolio view across all locations. Switch the active site from the selector in the menu."
      />

      {/* Portfolio totals */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Latest monthly electricity cost</p>
          <p className="text-xl font-bold mt-1">{formatINR(totalCost)}</p>
          <p className="text-[11px] text-ink-faint">across {sites.length} site{sites.length > 1 ? "s" : ""} (uploaded bills)</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified savings</p>
          <p className="text-xl font-bold text-verified-600 mt-1">{formatINR(totalVerified)}/yr</p>
          <p className="text-[11px] text-ink-faint">measured &amp; verified</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Money at risk</p>
          <p className="text-xl font-bold text-attention-700 mt-1">~{formatINRFull(totalRisk)}/mo</p>
          <p className="text-[11px] text-ink-faint">pending actions across sites (estimated)</p>
        </Card>
      </div>

      {comparison ? (
        <Card className="p-4 mb-6 bg-info-50/50 border-info-100">
          <p className="text-sm text-ink-soft">
            <strong>Comparison:</strong> {comparison}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map(({ site, latest, wallet, active }) => (
          <Card key={site.id} className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-bold text-lg">{site.name}</h2>
                <p className="text-sm text-ink-muted">
                  {site.industry} · {site.location}, {site.state} · {site.connectionType}
                </p>
              </div>
              <HealthBadge health={site.health} />
            </div>
            <p className="text-sm text-ink-soft mt-2">{site.healthReason}</p>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">Latest bill</dt>
                <dd className="font-semibold">
                  {latest ? formatINR(latest.amount) : "No bills yet"}{" "}
                  {latest ? <DataTagBadge tag={latest.dataTag} className="ml-1" /> : null}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Savings identified</dt>
                <dd className="font-semibold">{formatINR(wallet.identified)}/yr</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Verified savings</dt>
                <dd className="font-semibold text-verified-600">
                  {wallet.verified > 0 ? `${formatINR(wallet.verified)}/yr ✓` : "None yet"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">Data connection</dt>
                <dd className="font-semibold">
                  {site.dataReadiness === "bill_data" ? "Bills only" : site.dataReadiness === "historical_interval" ? "Bills + meter files" : site.dataReadiness.replace(/_/g, " ")}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                WattZap level {site.maturityLevel} — {MATURITY_LEVELS[site.maturityLevel].name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.map((e) => (
                  <span key={e.id} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium">
                    {PRODUCTS.find((p) => p.slug === e.product)?.name}
                    {e.state === "onboarding" ? " (onboarding)" : ""}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
