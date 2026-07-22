import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { savingsForSite, sitesForUser } from "@/lib/db";
import { byProduct, walletSummary, STAGE_LABELS } from "@/lib/savings";
import { formatINR, formatINRFull } from "@/lib/format";
import { Card, DataTagBadge, EmptyState, PageHeader } from "@/components/ui";
import { SavingsPipeline, StageDots } from "@/components/domain";
import { productBySlug } from "@/lib/data/products";

export const metadata: Metadata = { title: "Savings Wallet" };

export default async function SavingsWalletPage() {
  const { user, activeSite: site } = await requireUser();
  const entries = await savingsForSite(site.id);
  const wallet = walletSummary(entries);
  const products = byProduct(entries);
  const allSites = await sitesForUser(user);
  const siteWallets = await Promise.all(
    allSites.map(async (s) => ({ site: s, wallet: walletSummary(await savingsForSite(s.id)) }))
  );

  if (entries.length === 0) {
    return (
      <div>
        <PageHeader title="Savings Wallet" />
        <EmptyState
          title="No savings tracked yet"
          message="Your Savings Wallet fills up once EnergyScan identifies opportunities. Every entry shows its full calculation — from first estimate to independent verification."
          action={{ href: "/products/energyscan-lite", label: "Start with EnergyScan" }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Savings Wallet"
        subtitle={`A transparent record of energy value at ${site.shortName} — not a bank account. Click any entry to see exactly how the number was calculated and verified.`}
      />

      <SavingsPipeline wallet={wallet} />

      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified — lifetime</p>
          <p className="text-xl font-bold text-verified-600 mt-1">{formatINR(wallet.verified)}/yr</p>
          <p className="text-[11px] text-ink-faint">First verification: 15 Jul 2026</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified — monthly rate</p>
          <p className="text-xl font-bold text-verified-600 mt-1">{formatINRFull(Math.round(wallet.verified / 12))}</p>
          <p className="text-[11px] text-ink-faint">per month, measured</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Awaiting your decision</p>
          <p className="text-xl font-bold text-attention-700 mt-1">{formatINR(wallet.pendingAction)}/yr</p>
          <p className="text-[11px] text-ink-faint">Savings lose value every month they wait</p>
        </Card>
      </div>

      {/* Ledger */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-3">Savings ledger</h2>
        <div className="space-y-3">
          {entries.map((e) => (
            <Link key={e.id} href={`/savings/${e.id}`} className="block">
              <Card className="p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StageDots stage={e.stage} />
                      <span className="text-xs font-semibold text-ink-muted">{STAGE_LABELS[e.stage]}</span>
                      <DataTagBadge tag={e.dataTag} />
                    </div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {productBySlug(e.product)?.name} · {e.status}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {e.verifiedAnnual ? (
                      <>
                        <p className="font-bold text-verified-600">{formatINR(e.verifiedAnnual)}/yr ✓</p>
                        <p className="text-[11px] text-ink-faint">expected {formatINR(e.expectedAnnual)}/yr</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold">{formatINR(e.expectedAnnual)}/yr</p>
                        <p className="text-[11px] text-ink-faint">expected ({e.dataTag})</p>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink mt-1">
                      Full calculation <ArrowRight className="h-3 w-3" aria-hidden />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Product-wise */}
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold mb-3">Savings by product</h2>
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.product} className="flex items-center justify-between text-sm">
                <span>{productBySlug(p.product as never)?.name ?? p.product}</span>
                <span className="font-semibold">
                  {p.verified > 0 ? (
                    <span className="text-verified-600">{formatINR(p.verified)}/yr ✓</span>
                  ) : (
                    <>{formatINR(p.expected)}/yr <span className="text-ink-faint font-normal">est.</span></>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold mb-3">Savings by site</h2>
          <ul className="space-y-2">
            {siteWallets.map(({ site: s, wallet: w }) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <span className="font-semibold">
                  {formatINR(w.identified)}/yr identified
                  {w.verified > 0 ? (
                    <span className="text-verified-600"> · {formatINR(w.verified)} verified</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
