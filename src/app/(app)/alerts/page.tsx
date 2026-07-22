import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { alertsForSite } from "@/lib/db";
import { markAlertReadAction } from "@/lib/actions";
import { formatINRFull } from "@/lib/format";
import { Card, DataTagBadge, EmptyState, PageHeader, StatusPill } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/permissions";
import { productBySlug } from "@/lib/data/products";
import type { AlertCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Alerts" };

const CATEGORY_META: Record<AlertCategory, { label: string; tone: "red" | "amber" | "brand" | "blue" | "stone" }> = {
  critical: { label: "Critical", tone: "red" },
  action_required: { label: "Action required", tone: "amber" },
  opportunity: { label: "Opportunity", tone: "brand" },
  product_recommendation: { label: "Recommendation", tone: "brand" },
  information: { label: "Information", tone: "blue" },
  data_issue: { label: "Data issue", tone: "stone" },
};

const CATEGORY_PRIORITY: AlertCategory[] = [
  "critical",
  "action_required",
  "opportunity",
  "product_recommendation",
  "data_issue",
  "information",
];

export default function AlertsPage() {
  const { activeSite: site } = requireUser();
  const alerts = alertsForSite(site.id).sort((a, b) => {
    const cat = CATEGORY_PRIORITY.indexOf(a.category) - CATEGORY_PRIORITY.indexOf(b.category);
    if (cat !== 0) return cat;
    return (b.financialImpact ?? 0) - (a.financialImpact ?? 0);
  });

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle="Sorted by financial impact and urgency. Every alert tells you what happened, what it costs, and what to do."
      />

      {alerts.length === 0 ? (
        <EmptyState
          title="No alerts"
          message="Nothing needs your attention right now. Alerts appear here when WattZap detects penalties, anomalies or new opportunities."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const meta = CATEGORY_META[a.category];
            return (
              <Card key={a.id} className={`p-5 ${a.read ? "opacity-75" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusPill label={meta.label} tone={meta.tone} />
                  <DataTagBadge tag={a.dataTag} />
                  {a.financialImpact ? (
                    <span className="text-sm font-bold text-attention-700 ml-auto">
                      ~{formatINRFull(a.financialImpact)}
                    </span>
                  ) : null}
                </div>
                <h2 className="font-bold">{a.title}</h2>
                <div className="mt-2 grid gap-2 text-sm text-ink-soft">
                  <p><strong className="text-ink-muted">What happened:</strong> {a.whatHappened}</p>
                  <p><strong className="text-ink-muted">Why it matters:</strong> {a.whyItMatters}</p>
                  <p><strong className="text-ink-muted">Recommended action:</strong> {a.recommendedAction}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>{new Date(a.whenHappened.replace(" ", "T")).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: a.whenHappened.includes(":") ? "short" : undefined })}</span>
                  {a.deadline ? <span>Deadline: <strong className="text-ink">{a.deadline}</strong></span> : null}
                  <span>For: <strong className="text-ink">{ROLE_LABELS[a.responsibleRole]}</strong></span>
                  <Link href={`/products/${a.product}`} className="font-semibold underline">
                    {productBySlug(a.product)?.name}
                  </Link>
                  <span className="text-ink-faint">Evidence: {a.evidence}</span>
                </div>
                {!a.read ? (
                  <form action={markAlertReadAction} className="mt-3">
                    <input type="hidden" name="alertId" value={a.id} />
                    <button type="submit" className="btn-secondary !min-h-[38px] !py-1.5 text-sm">
                      Mark as read
                    </button>
                  </form>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-ink-faint mt-6">
        Alert delivery channels (in-app, email, WhatsApp, SMS) are configured in{" "}
        <Link href="/settings" className="underline">Settings</Link>.
      </p>
    </div>
  );
}
