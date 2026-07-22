import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, FileText, X } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { findSavingsByOpportunity, getOpportunity, userCanAccessSite } from "@/lib/db";
import { canDecideOpportunity, ROLE_LABELS } from "@/lib/permissions";
import { formatDate, formatINR } from "@/lib/format";
import { commentOpportunityAction, decideOpportunityAction } from "@/lib/actions";
import { Card, ConfidenceBadge, DataTagBadge } from "@/components/ui";
import { OpportunityStatusPill } from "@/components/domain";
import { productBySlug } from "@/lib/data/products";

export const metadata: Metadata = { title: "Opportunity" };

export default async function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const { user } = await requireUser();
  const opp = await getOpportunity(params.id);
  if (!opp || !(await userCanAccessSite(user, opp.siteId))) notFound();

  const product = productBySlug(opp.product);
  const decidable = canDecideOpportunity(user) && !["approved", "rejected", "verified", "closed", "implemented", "measuring"].includes(opp.status);
  const savings = await findSavingsByOpportunity(opp.id);

  return (
    <div className="max-w-3xl">
      <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink mb-4">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All opportunities
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <OpportunityStatusPill status={opp.status} />
        <DataTagBadge tag={opp.dataTag} />
        <ConfidenceBadge level={opp.confidence} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{opp.title}</h1>
      <p className="text-ink-muted mt-2">{opp.plainExplanation}</p>

      {/* Financial summary */}
      <Card className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden bg-stone-200 !p-0">
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Annual saving</p>
          <p className="text-lg font-bold text-verified-600">{formatINR(opp.annualSaving)}</p>
          <p className="text-[11px] text-ink-faint capitalize">{opp.dataTag}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Cost</p>
          <p className="text-lg font-bold">{opp.implementationCost === 0 ? "None" : formatINR(opp.implementationCost)}</p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Payback</p>
          <p className="text-lg font-bold">
            {opp.paybackMonths === null ? "—" : opp.paybackMonths === 0 ? "Immediate" : `${opp.paybackMonths} mo`}
          </p>
        </div>
        <div className="bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Complexity</p>
          <p className="text-lg font-bold capitalize">{opp.complexity}</p>
        </div>
      </Card>

      {/* What happened / why it matters */}
      <div className="mt-5 space-y-4">
        <Card className="p-5">
          <h2 className="font-bold mb-1">What happened</h2>
          <p className="text-sm text-ink-soft">{opp.whatHappened}</p>
          <h2 className="font-bold mb-1 mt-4">Why it matters</h2>
          <p className="text-sm text-ink-soft">{opp.whyItMatters}</p>
          <h2 className="font-bold mb-1 mt-4">Required action</h2>
          <p className="text-sm text-ink-soft">{opp.requiredAction}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-muted">
            <span>Decision owner: <strong className="text-ink">{ROLE_LABELS[opp.decisionOwnerRole]}</strong></span>
            <span>WattZap product: <strong className="text-ink">{product?.name}</strong></span>
            <span>Identified: <strong className="text-ink">{formatDate(opp.identifiedOn)}</strong></span>
          </div>
        </Card>

        <details className="card p-5">
          <summary className="font-bold cursor-pointer">Technical detail (for your engineer)</summary>
          <p className="text-sm text-ink-soft mt-2">{opp.technicalDetail}</p>
        </details>

        <Card className="p-5">
          <h2 className="font-bold mb-2 inline-flex items-center gap-2">
            <FileText className="h-4 w-4" aria-hidden /> Evidence
          </h2>
          <ul className="text-sm text-ink-soft space-y-1.5">
            {opp.evidence.map((e) => (
              <li key={e} className="flex gap-2">
                <span className="text-brand-600 mt-0.5">•</span>
                {e}
              </li>
            ))}
          </ul>
        </Card>

        {savings ? (
          <Card className="p-5 bg-verified-50/40">
            <h2 className="font-bold mb-1">In your Savings Wallet</h2>
            <p className="text-sm text-ink-soft">
              This opportunity is tracked as “{savings.title}” at stage{" "}
              <strong className="capitalize">{savings.stage}</strong>.{" "}
              <Link href={`/savings/${savings.id}`} className="font-semibold underline">
                See the full calculation
              </Link>
            </p>
          </Card>
        ) : null}

        {/* Decision */}
        {decidable ? (
          <Card className="p-5">
            <h2 className="font-bold mb-3">Your decision</h2>
            <div className="flex flex-wrap gap-2">
              <form action={decideOpportunityAction}>
                <input type="hidden" name="opportunityId" value={opp.id} />
                <input type="hidden" name="decision" value="approved" />
                <button type="submit" className="btn-primary">
                  <Check className="h-4 w-4" aria-hidden /> Approve
                </button>
              </form>
              <form action={decideOpportunityAction}>
                <input type="hidden" name="opportunityId" value={opp.id} />
                <input type="hidden" name="decision" value="rejected" />
                <button type="submit" className="btn-danger">
                  <X className="h-4 w-4" aria-hidden /> Reject
                </button>
              </form>
            </div>
            <p className="text-xs text-ink-faint mt-2">
              Approving does not commit any payment — it tells WattZap to proceed with the next step
              shown above.
            </p>
          </Card>
        ) : !canDecideOpportunity(user) ? (
          <Card className="p-5 bg-stone-50">
            <p className="text-sm text-ink-muted">
              Your role ({ROLE_LABELS[user.role]}) cannot approve or reject this opportunity. The
              decision belongs to the {ROLE_LABELS[opp.decisionOwnerRole]}. You can still ask a
              question below.
            </p>
          </Card>
        ) : null}

        {/* Ask a question */}
        <Card className="p-5">
          <h2 className="font-bold mb-3">Ask a question or add a comment</h2>
          <form action={commentOpportunityAction} className="space-y-3">
            <input type="hidden" name="opportunityId" value={opp.id} />
            <label htmlFor="comment" className="sr-only">Your question</label>
            <textarea id="comment" name="comment" rows={3} required className="input !min-h-[80px]"
              placeholder="e.g. Can this be done during the maintenance shutdown?" />
            <button type="submit" className="btn-secondary">Send to WattZap</button>
          </form>
        </Card>

        {/* Activity history */}
        <Card className="p-5">
          <h2 className="font-bold mb-3">Activity history</h2>
          <ol className="space-y-3">
            {[...opp.activity].reverse().map((a) => (
              <li key={a.id} className="flex gap-3 text-sm">
                <span className="text-ink-faint whitespace-nowrap">{formatDate(a.date)}</span>
                <div>
                  <p>
                    <strong>{a.actor}</strong> — {a.event}
                  </p>
                  {a.comment ? <p className="text-ink-muted mt-0.5">“{a.comment}”</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
