import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  actionsForSite,
  alertsForSite,
  billsForSite,
  savingsForSite,
} from "@/lib/db";
import { productsForSite } from "@/lib/entitlements";
import { walletSummary } from "@/lib/savings";
import { canCompleteAction, ROLE_LABELS } from "@/lib/permissions";
import { formatINR, formatINRFull, greeting } from "@/lib/format";
import { Card, DataTagBadge, HealthBadge } from "@/components/ui";
import { ActionCard, SavingsPipeline } from "@/components/domain";
import { MATURITY_LEVELS } from "@/lib/data/products";

export default function HomePage() {
  const { user, activeSite: site } = requireUser();
  const savings = savingsForSite(site.id);
  const wallet = walletSummary(savings);
  const actions = actionsForSite(site.id).filter((a) => a.status !== "done");
  const alerts = alertsForSite(site.id).filter((a) => !a.read);
  const bills = billsForSite(site.id);
  const products = productsForSite(site.id);
  const maturity = MATURITY_LEVELS[site.maturityLevel];

  // One highest-priority action: prefer the signed-in user's role, then value.
  const topAction =
    actions.find((a) => a.assigneeRole === user.role) ??
    [...actions].sort((a, b) => b.monthlyValue - a.monthlyValue)[0];

  const attentionCount = alerts.filter(
    (a) => a.category === "critical" || a.category === "action_required"
  ).length;

  const latest = bills[bills.length - 1];
  const prev = bills[bills.length - 2];
  const kwhChange =
    latest && prev ? ((latest.unitsKwh - prev.unitsKwh) / prev.unitsKwh) * 100 : null;

  const recentProgress = [
    { icon: BadgeCheck, text: "First saving verified: ₹1.25 lakh/year (APFC repair)", when: "15 Jul" },
    { icon: CheckCircle2, text: "EMS Lite onboarding started — site survey on 29 Jul", when: "8 Jul" },
    { icon: Sparkles, text: "PF Guard activated for this site", when: "5 Jun" },
    { icon: CheckCircle2, text: "EnergyScan Pro report delivered (7 opportunities)", when: "28 May" },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting — the 10-second answer */}
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {greeting()}, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-ink-muted mt-1 text-base">
          {site.health === "good"
            ? `${site.shortName} is performing normally.`
            : `${site.shortName} is performing normally, but ${
                attentionCount === 1 ? "one action needs" : `${attentionCount} actions need`
              } your attention.`}
        </p>
      </section>

      {/* Are we okay? / Are we losing money? */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Site health
            </h2>
            <HealthBadge health={site.health} />
          </div>
          <p className="mt-3 text-ink-soft">{site.healthReason}</p>
          <p className="mt-2 text-xs text-ink-faint">
            Based on {site.dataReadiness === "bill_data" ? "uploaded bills" : "uploaded bills and meter files"} —
            live monitoring is {products.some((p) => p.def.slug === "ems-lite" && p.entitlement.state === "active") ? "active" : "not connected yet"}.
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
              Money at risk
            </h2>
            <TriangleAlert className="h-5 w-5 text-attention-600" aria-hidden />
          </div>
          <p className="mt-3 text-2xl font-bold text-attention-700">
            ~{formatINRFull(wallet.monthlyAtRisk)}/month
          </p>
          <p className="text-sm text-ink-muted mt-1">
            remains at risk from demand spikes, poor power factor and pending decisions.{" "}
            <Link href="/opportunities" className="font-semibold text-ink underline">
              See what to do
            </Link>
          </p>
          <div className="mt-2">
            <DataTagBadge tag="estimated" />
          </div>
        </Card>
      </section>

      {/* How much has WattZap saved us? */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Savings snapshot</h2>
          <Link href="/savings" className="text-sm font-semibold text-ink underline">
            Open Savings Wallet
          </Link>
        </div>
        <SavingsPipeline wallet={wallet} />
        {wallet.pendingAction > 0 ? (
          <p className="text-sm text-ink-muted mt-2">
            <strong className="text-ink">{formatINR(wallet.pendingAction)}/year</strong> is still
            waiting for your decision.
          </p>
        ) : null}
      </section>

      {/* What should we do? — one top action */}
      {topAction ? (
        <section>
          <h2 className="text-lg font-bold mb-3">Your top action</h2>
          <ActionCard action={topAction} canComplete={canCompleteAction(user)} />
          {actions.length > 1 ? (
            <p className="text-sm text-ink-muted mt-2">
              {actions.length - 1} more action{actions.length > 2 ? "s" : ""} —{" "}
              <Link href="/opportunities" className="font-semibold text-ink underline">
                view all
              </Link>
            </p>
          ) : null}
        </section>
      ) : null}

      {/* What changed + recent progress */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted mb-3">
            What changed
          </h2>
          {latest && prev && kwhChange !== null ? (
            <div className="space-y-2 text-sm text-ink-soft">
              <p className="flex items-start gap-2">
                <TrendingDown
                  className={`h-4 w-4 mt-0.5 ${kwhChange <= 0 ? "text-verified-600" : "text-attention-600 rotate-180"}`}
                  aria-hidden
                />
                Compared with the previous bill, electricity consumption{" "}
                {kwhChange <= 0 ? "reduced" : "increased"} by {Math.abs(kwhChange).toFixed(1)}%.
              </p>
              {latest.pfPenalty > 0 ? (
                <p className="flex items-start gap-2">
                  <TriangleAlert className="h-4 w-4 mt-0.5 text-attention-600" aria-hidden />
                  The latest bill included a {formatINRFull(latest.pfPenalty)} power-factor penalty —
                  the cause has been repaired and is being watched by PF Guard.
                </p>
              ) : null}
              {latest.mdPenalty > 0 ? (
                <p className="flex items-start gap-2">
                  <TriangleAlert className="h-4 w-4 mt-0.5 text-attention-600" aria-hidden />
                  Demand exceeded your contracted limit and added {formatINRFull(latest.mdPenalty)} in
                  charges.
                </p>
              ) : null}
              <p className="text-xs text-ink-faint pt-1">
                From uploaded bills (latest: {latest.month}). <DataTagBadge tag="uploaded" />
              </p>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">
              Not enough bill history yet. Upload more bills to see month-on-month changes.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted mb-3">
            Recent progress
          </h2>
          <ul className="space-y-2.5">
            {recentProgress.map((p) => (
              <li key={p.text} className="flex items-start gap-2.5 text-sm">
                <p.icon className="h-4 w-4 mt-0.5 text-verified-600 shrink-0" aria-hidden />
                <span className="text-ink-soft flex-1">{p.text}</span>
                <span className="text-xs text-ink-faint shrink-0">{p.when}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Maturity + journey entry point */}
      <section>
        <Card className="p-5 bg-gradient-to-r from-brand-50 to-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Your WattZap level: {site.maturityLevel} — {maturity.name}
              </p>
              <p className="text-sm text-ink-soft mt-1 max-w-xl">
                {maturity.description} <strong>Next:</strong> {maturity.nextStep}
              </p>
            </div>
            <Link href="/journey" className="btn-brand">
              View your Savings Journey <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Card>
      </section>

      <p className="text-xs text-ink-faint">
        Signed in as {user.name} ({ROLE_LABELS[user.role]}). Data shown for {site.name}.
      </p>
    </div>
  );
}
