import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { savingsForSite } from "@/lib/db";
import { journeyForSite, type StageSummary } from "@/lib/entitlements";
import { formatINR } from "@/lib/format";
import { Card, PageHeader, ProductStateBadge } from "@/components/ui";
import { AppIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Savings Journey" };

const STAGE_TONES: Record<StageSummary["state"], string> = {
  verified: "border-verified-500 bg-verified-50",
  active: "border-verified-500 bg-white",
  monitoring: "border-verified-500 bg-white",
  in_progress: "border-attention-500 bg-attention-50/50",
  action_required: "border-attention-500 bg-attention-50/50",
  recommended: "border-brand-400 bg-brand-50/60",
  ready: "border-info-500 bg-info-50/50",
  opportunity: "border-info-500 bg-white",
  info_required: "border-attention-500 bg-white",
  not_started: "border-stone-200 bg-white",
  locked: "border-stone-200 bg-stone-50/60",
};

export default function JourneyPage() {
  const { activeSite: site } = requireUser();
  const stages = journeyForSite(site.id, savingsForSite(site.id));

  return (
    <div>
      <PageHeader
        title="Your WattZap Savings Journey"
        subtitle={`Six stages from diagnosis to independently verified savings at ${site.name}. Locked stages are never broken — each one shows exactly how to unlock it.`}
      />

      {/* Horizontal journey map on desktop, vertical steps on mobile */}
      <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stages.map((stage, i) => (
          <li key={stage.id} className="relative">
            {/* Vertical connector (mobile) */}
            {i < stages.length - 1 ? (
              <span
                className="sm:hidden absolute left-6 top-full h-4 w-px bg-stone-300"
                aria-hidden
              />
            ) : null}
            <Card className={`p-4 h-full border-2 ${STAGE_TONES[stage.state]}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white text-sm font-bold">
                  {stage.state === "verified" || stage.state === "active" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : stage.state === "locked" ? (
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted text-right">
                  {stage.stateLabel}
                </span>
              </div>
              <h2 className="font-bold text-lg">{stage.name}</h2>
              <p className="text-xs text-ink-muted mt-0.5 min-h-[2.5rem]">{stage.purpose}</p>

              <div className="mt-3 space-y-1.5">
                {stage.products.map((p) => (
                  <Link
                    key={p.def.slug}
                    href={`/products/${p.def.slug}`}
                    className="flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 -mx-1 hover:bg-white/70 text-sm"
                  >
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <AppIcon name={p.def.icon} className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span className="truncate font-medium">{p.def.name}</span>
                    </span>
                    <ProductStateBadge state={p.entitlement.state} />
                  </Link>
                ))}
              </div>

              {(stage.savingsIdentified > 0 || stage.savingsVerified > 0) && (
                <div className="mt-3 border-t border-stone-200/70 pt-2 text-xs space-y-0.5">
                  {stage.savingsIdentified > 0 ? (
                    <p className="text-ink-muted">
                      Identified:{" "}
                      <strong className="text-ink">{formatINR(stage.savingsIdentified)}/yr</strong>
                    </p>
                  ) : null}
                  {stage.savingsVerified > 0 ? (
                    <p className="text-verified-700 font-semibold">
                      Verified: {formatINR(stage.savingsVerified)}/yr ✓
                    </p>
                  ) : null}
                </div>
              )}

              {stage.nextAction ? (
                <p className="mt-3 text-xs font-semibold text-brand-700 inline-flex items-center gap-1">
                  {stage.nextAction} <ArrowRight className="h-3 w-3" aria-hidden />
                </p>
              ) : null}
            </Card>
          </li>
        ))}
      </ol>

      <p className="text-xs text-ink-faint mt-6">
        Product access is controlled by WattZap&apos;s entitlement system — a locked product always
        shows what it does, why it may help you, and what unlocks it. Nothing activates without
        your approval.
      </p>
    </div>
  );
}
