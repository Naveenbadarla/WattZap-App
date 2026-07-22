import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, entitlementsForSite, savingsForSite } from "@/lib/db";
import { isInternal } from "@/lib/permissions";
import { walletSummary } from "@/lib/savings";
import { formatDate, formatINR } from "@/lib/format";
import { Card, PageHeader, ProductStateBadge, StatusPill } from "@/components/ui";
import { PRODUCTS } from "@/lib/data/products";

export const metadata: Metadata = { title: "WattZap Console" };

/**
 * Internal customer view for WattZap staff. Role-gated server-side —
 * customer roles get a 404, not a redirect, so the route's existence
 * is not advertised.
 */
export default function InternalPage() {
  const { user } = requireUser();
  if (!isInternal(user)) notFound();

  const org = db().org;
  const sites = db().sites;
  const openSupport = db().supportRequests.filter((r) => r.status !== "resolved");

  return (
    <div>
      <PageHeader
        title="WattZap Console — customer view"
        subtitle={`Internal view of ${org.name} (${user.internalRole?.replace(/_/g, " ")}). Customers never see this page.`}
      />

      <div className="space-y-6">
        {sites.map((site) => {
          const wallet = walletSummary(savingsForSite(site.id));
          const ents = entitlementsForSite(site.id);
          const opps = db().opportunities.filter((o) => o.siteId === site.id);
          const pendingDecisions = opps.filter((o) => ["recommended", "new", "info_required", "under_review"].includes(o.status));
          return (
            <Card key={site.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="font-bold text-lg">{site.name}</h2>
                  <p className="text-sm text-ink-muted">
                    {site.industry} · Level {site.maturityLevel} · Data: {site.dataReadiness.replace(/_/g, " ")}
                  </p>
                </div>
                <StatusPill
                  label={site.health === "good" ? "Healthy" : site.health === "needs_attention" ? "Needs attention" : "Critical"}
                  tone={site.health === "good" ? "green" : site.health === "needs_attention" ? "amber" : "red"}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-4 text-sm mb-4">
                <div><p className="text-xs text-ink-muted">Identified</p><p className="font-bold">{formatINR(wallet.identified)}/yr</p></div>
                <div><p className="text-xs text-ink-muted">Approved</p><p className="font-bold">{formatINR(wallet.approved)}/yr</p></div>
                <div><p className="text-xs text-ink-muted">Verified</p><p className="font-bold text-verified-600">{formatINR(wallet.verified)}/yr</p></div>
                <div><p className="text-xs text-ink-muted">Customer decisions pending</p><p className="font-bold text-attention-700">{pendingDecisions.length}</p></div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Entitlements (backend state)</p>
              <div className="flex flex-wrap gap-1.5">
                {ents.map((e) => (
                  <span key={e.id} className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 border border-stone-200 pl-2.5 pr-1 py-0.5 text-xs font-medium">
                    {PRODUCTS.find((p) => p.slug === e.product)?.name}
                    <ProductStateBadge state={e.state} />
                  </span>
                ))}
              </div>

              {pendingDecisions.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Waiting on customer</p>
                  <ul className="text-sm text-ink-soft space-y-1">
                    {pendingDecisions.map((o) => (
                      <li key={o.id}>• {o.title} — {formatINR(o.annualSaving)}/yr ({o.status.replace(/_/g, " ")})</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Card>
          );
        })}

        <Card className="p-5">
          <h2 className="font-bold mb-3">Open support requests</h2>
          {openSupport.length === 0 ? (
            <p className="text-sm text-ink-muted">No open requests.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {openSupport.map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-2">
                  <span>{r.subject}</span>
                  <span className="text-ink-faint">{formatDate(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <p className="text-xs text-ink-faint">
          Internal roles (analyst, solar engineer, CSM, finance reviewer, field technician, savings
          verifier) get scoped views of this console in production; the demo ships one analyst
          account.
        </p>
      </div>
    </div>
  );
}
