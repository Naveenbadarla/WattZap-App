import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, HandHelping, Lock, User as UserIcon } from "lucide-react";
import { AppIcon } from "@/components/icons";
import {
  Card,
  ConfidenceBadge,
  DataTagBadge,
  ProductStateBadge,
  StatusPill,
} from "@/components/ui";
import type { ProductWithEntitlement } from "@/lib/entitlements";
import { formatDate, formatINR, formatINRFull } from "@/lib/format";
import { STAGE_LABELS, STAGE_ORDER, type WalletSummary } from "@/lib/savings";
import { completeActionItemAction, requestSupportForActionAction } from "@/lib/actions";
import { PRODUCTS } from "@/lib/data/products";
import { ROLE_LABELS } from "@/lib/permissions";
import type { ActionItem, Opportunity, SavingsStage } from "@/lib/types";

/** Shared domain components used across pages. */

// ---------- Savings pipeline (Identified → Verified) ----------

export function SavingsPipeline({ wallet }: { wallet: WalletSummary }) {
  const steps: { key: string; label: string; value: number; tone: string; hint: string }[] = [
    { key: "identified", label: "Identified", value: wallet.identified, tone: "text-ink", hint: "All savings found so far (estimated, per year)" },
    { key: "approved", label: "Approved", value: wallet.approved, tone: "text-ink", hint: "Savings you have approved" },
    { key: "implemented", label: "Implemented", value: wallet.implemented, tone: "text-ink", hint: "Changes made on site" },
    { key: "verified", label: "Verified", value: wallet.verified, tone: "text-verified-600", hint: "Measured and independently verified" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-card overflow-hidden border border-stone-200 bg-stone-200">
      {steps.map((s, i) => (
        <div key={s.key} className="bg-white p-4" title={s.hint}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted flex items-center gap-1">
            {s.label}
            {i < steps.length - 1 ? <ArrowRight className="h-3 w-3 hidden sm:block" aria-hidden /> : null}
          </p>
          <p className={`mt-1 text-xl font-bold ${s.tone}`}>{formatINR(s.value)}</p>
          <p className="text-[11px] text-ink-faint">per year</p>
        </div>
      ))}
    </div>
  );
}

export function StageDots({ stage }: { stage: SavingsStage }) {
  const idx = STAGE_ORDER.indexOf(stage);
  return (
    <div className="flex items-center gap-1" aria-label={`Stage: ${STAGE_LABELS[stage]}`}>
      {STAGE_ORDER.map((s, i) => (
        <span
          key={s}
          title={STAGE_LABELS[s]}
          className={`h-2 w-2 rounded-full ${
            i <= idx ? (stage === "verified" ? "bg-verified-500" : "bg-brand-500") : "bg-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

// ---------- Opportunity decision card ----------

const OPP_STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" | "blue" | "stone" | "brand" }> = {
  new: { label: "New", tone: "blue" },
  under_review: { label: "Under review", tone: "blue" },
  info_required: { label: "Information required", tone: "amber" },
  recommended: { label: "Recommended", tone: "brand" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "stone" },
  planned: { label: "Planned", tone: "blue" },
  in_progress: { label: "In progress", tone: "amber" },
  implemented: { label: "Implemented", tone: "green" },
  measuring: { label: "Measurement in progress", tone: "amber" },
  verified: { label: "Verified", tone: "green" },
  closed: { label: "Closed", tone: "stone" },
};

export function OpportunityStatusPill({ status }: { status: string }) {
  const s = OPP_STATUS[status] ?? { label: status, tone: "stone" as const };
  return <StatusPill label={s.label} tone={s.tone} />;
}

export function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Card className="p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <OpportunityStatusPill status={opp.status} />
            <DataTagBadge tag={opp.dataTag} />
            <ConfidenceBadge level={opp.confidence} />
          </div>
          <h3 className="font-bold text-base leading-snug">
            <Link href={`/opportunities/${opp.id}`} className="hover:underline">
              {opp.title}
            </Link>
          </h3>
          <p className="text-sm text-ink-muted mt-1">{opp.plainExplanation}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-bold text-verified-600">{formatINR(opp.annualSaving)}</p>
          <p className="text-[11px] text-ink-faint">per year ({opp.dataTag})</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span>
          Cost: <strong className="text-ink">{opp.implementationCost === 0 ? "None" : formatINR(opp.implementationCost)}</strong>
        </span>
        {opp.paybackMonths !== null && opp.paybackMonths > 0 ? (
          <span>
            Payback: <strong className="text-ink">{opp.paybackMonths} months</strong>
          </span>
        ) : null}
        <span>
          Decision: <strong className="text-ink">{ROLE_LABELS[opp.decisionOwnerRole]}</strong>
        </span>
        <span className="inline-flex items-center gap-1">
          <AppIcon name={productIcon(opp.product)} className="h-3.5 w-3.5" />
          {productLabel(opp.product)}
        </span>
      </div>
      <div className="mt-3">
        <Link href={`/opportunities/${opp.id}`} className="btn-secondary !min-h-[38px] !py-1.5 text-sm">
          Review &amp; decide <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function productLabel(slug: string): string {
  return PRODUCTS.find((p) => p.slug === slug)?.name ?? slug;
}
function productIcon(slug: string): string {
  return PRODUCTS.find((p) => p.slug === slug)?.icon ?? "zap";
}

// ---------- Product card (journey & modules) ----------

export function ProductCard({ p, siteId }: { p: ProductWithEntitlement; siteId: string }) {
  const { def, entitlement: ent } = p;
  const locked = ent.state === "locked";
  return (
    <Card className={`p-5 flex flex-col ${locked ? "bg-stone-50/60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              locked ? "bg-stone-200 text-stone-500" : "bg-brand-100 text-brand-700"
            }`}
          >
            {locked ? <Lock className="h-5 w-5" aria-hidden /> : <AppIcon name={def.icon} />}
          </span>
          <div>
            <h3 className="font-bold leading-tight">{def.name}</h3>
            <p className="text-xs text-ink-muted">{def.tagline}</p>
          </div>
        </div>
        <ProductStateBadge state={ent.state} />
      </div>
      <p className="text-sm text-ink-soft mt-3 flex-1">{ent.stateReason}</p>
      {ent.estimatedAnnualValue ? (
        <p className="text-sm mt-2">
          Expected value:{" "}
          <strong className="text-verified-600">{formatINR(ent.estimatedAnnualValue)}/year</strong>{" "}
          <span className="text-ink-faint text-xs">(estimated)</span>
        </p>
      ) : null}
      {ent.unlockSteps.length > 0 ? (
        <div className="mt-3 rounded-xl bg-stone-50 border border-stone-100 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
            {locked ? "How to unlock" : "Next steps"}
          </p>
          <ul className="text-sm text-ink-soft space-y-1">
            {ent.unlockSteps.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-brand-600 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4">
        <Link href={`/products/${def.slug}`} className="btn-secondary w-full !min-h-[40px] !py-2 text-sm">
          {ent.state === "recommended"
            ? "Review recommendation"
            : ent.state === "onboarding"
              ? "Track onboarding"
              : locked
                ? "Learn more"
                : "Open"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

// ---------- Action card ----------

export function ActionCard({ action, canComplete }: { action: ActionItem; canComplete: boolean }) {
  const done = action.status === "done";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className={`font-semibold ${done ? "line-through text-ink-faint" : ""}`}>{action.title}</h4>
          <p className="text-sm text-ink-muted mt-0.5">{action.detail}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5" aria-hidden /> {action.assigneeName} ({ROLE_LABELS[action.assigneeRole]})
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Due {formatDate(action.dueDate)}
            </span>
            <span>
              Worth ~<strong className="text-ink">{formatINRFull(action.monthlyValue)}/month</strong>
            </span>
            <span className="capitalize">Difficulty: {action.difficulty}</span>
          </div>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1 text-verified-600 text-sm font-semibold shrink-0">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Done
          </span>
        ) : null}
      </div>
      {!done ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {canComplete ? (
            <form action={completeActionItemAction}>
              <input type="hidden" name="actionId" value={action.id} />
              <button type="submit" className="btn-primary !min-h-[38px] !py-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Mark as complete
              </button>
            </form>
          ) : null}
          {action.status !== "support_requested" ? (
            <form action={requestSupportForActionAction}>
              <input type="hidden" name="actionId" value={action.id} />
              <button type="submit" className="btn-secondary !min-h-[38px] !py-1.5 text-sm">
                <HandHelping className="h-4 w-4" aria-hidden /> Request WattZap support
              </button>
            </form>
          ) : (
            <span className="text-sm text-info-700 font-medium">WattZap support requested ✓</span>
          )}
        </div>
      ) : null}
    </Card>
  );
}
