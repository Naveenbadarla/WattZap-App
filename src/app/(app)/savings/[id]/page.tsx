import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db, userCanAccessSite } from "@/lib/db";
import { formatDate, formatINR, formatINRFull } from "@/lib/format";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/savings";
import { Card, ConfidenceBadge, DataTagBadge } from "@/components/ui";
import { productBySlug } from "@/lib/data/products";

export const metadata: Metadata = { title: "Savings calculation" };

export default function SavingsDetailPage({ params }: { params: { id: string } }) {
  const { user } = requireUser();
  const entry = db().savings.find((s) => s.id === params.id);
  if (!entry || !userCanAccessSite(user, entry.siteId)) notFound();

  const site = db().sites.find((s) => s.id === entry.siteId);
  const stageIdx = STAGE_ORDER.indexOf(entry.stage);

  return (
    <div className="max-w-3xl">
      <Link href="/savings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Savings Wallet
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <DataTagBadge tag={entry.dataTag} />
        <ConfidenceBadge level={entry.confidence} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{entry.title}</h1>
      <p className="text-ink-muted mt-1">
        {site?.name} · {productBySlug(entry.product)?.name} · {entry.status}
      </p>

      {/* Stage flow */}
      <Card className="mt-5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted mb-4">
          Where this saving stands
        </h2>
        <ol className="flex flex-col sm:flex-row sm:items-center gap-2">
          {STAGE_ORDER.map((s, i) => {
            const reached = i <= stageIdx;
            const isVerified = s === "verified" && reached;
            return (
              <li key={s} className="flex items-center gap-2 flex-1">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isVerified
                      ? "bg-verified-500 text-white"
                      : reached
                        ? "bg-brand-500 text-ink"
                        : "bg-stone-100 text-ink-faint"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-sm ${reached ? "font-semibold" : "text-ink-faint"}`}>
                  {STAGE_LABELS[s]}
                </span>
                {i < STAGE_ORDER.length - 1 ? (
                  <span className="hidden sm:block h-px flex-1 bg-stone-200" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Numbers */}
      <Card className="mt-4 grid grid-cols-2 gap-px overflow-hidden bg-stone-200 !p-0">
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Expected saving</p>
          <p className="text-xl font-bold mt-1">{formatINRFull(entry.monthlyExpected)}/month</p>
          <p className="text-[11px] text-ink-faint">{formatINR(entry.expectedAnnual)}/year (estimated)</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Verified saving</p>
          {entry.monthlyVerified ? (
            <>
              <p className="text-xl font-bold text-verified-600 mt-1">
                {formatINRFull(entry.monthlyVerified)}/month
              </p>
              <p className="text-[11px] text-ink-faint">
                {formatINR(entry.verifiedAnnual ?? 0)}/year (measured &amp; verified)
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-ink-faint mt-1">Not yet</p>
              <p className="text-[11px] text-ink-faint">Verification follows measurement</p>
            </>
          )}
        </div>
      </Card>

      {entry.varianceReason ? (
        <Card className="mt-4 p-5 bg-info-50/50">
          <h2 className="font-bold mb-1">Why expected and verified differ</h2>
          <p className="text-sm text-ink-soft">{entry.varianceReason}</p>
        </Card>
      ) : null}

      {/* Full calculation path */}
      <Card className="mt-4 p-5">
        <h2 className="font-bold mb-3">The full calculation</h2>
        <dl className="space-y-3 text-sm">
          <Row label="Baseline" value={entry.baseline} />
          <Row label="Measurement period" value={entry.measurementPeriod ?? "Not started yet"} />
          <Row label="Calculation method" value={entry.method} />
          {entry.adjustments ? <Row label="Adjustments" value={entry.adjustments} /> : null}
          <Row label="WattZap reviewer" value={entry.wattzapReviewer ?? "Not yet assigned"} />
          <Row label="Customer approver" value={entry.customerApprover ?? "Not yet approved"} />
          <Row label="Last updated" value={formatDate(entry.updatedAt)} />
        </dl>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="font-bold mb-2">Evidence</h2>
        <ul className="text-sm text-ink-soft space-y-1.5">
          {entry.evidence.map((e) => (
            <li key={e} className="flex gap-2">
              <span className="text-brand-600 mt-0.5">•</span>
              {e}
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-faint mt-3">
          Evidence files live in your Documents area with a full audit trail.
        </p>
      </Card>

      {entry.opportunityId ? (
        <p className="text-sm text-ink-muted mt-4">
          Linked opportunity:{" "}
          <Link href={`/opportunities/${entry.opportunityId}`} className="font-semibold underline">
            view the original recommendation
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid sm:grid-cols-[180px_1fr] gap-1">
      <dt className="font-semibold text-ink-muted">{label}</dt>
      <dd className="text-ink-soft">{value}</dd>
    </div>
  );
}
