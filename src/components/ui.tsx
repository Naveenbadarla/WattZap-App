import Link from "next/link";
import type { Confidence, DataTag, ProductState, SiteHealth } from "@/lib/types";
import { Info } from "lucide-react";

/** Small server-rendered UI primitives shared across the app. */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-ink-muted mt-1 max-w-2xl">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const dataTagStyles: Record<DataTag, { label: string; cls: string }> = {
  historical: { label: "Historical", cls: "bg-stone-100 text-stone-700 border-stone-200" },
  uploaded: { label: "Uploaded", cls: "bg-info-50 text-info-700 border-info-100" },
  estimated: { label: "Estimated", cls: "bg-attention-50 text-attention-700 border-attention-100" },
  simulated: { label: "Simulated", cls: "bg-purple-50 text-purple-700 border-purple-100" },
  live: { label: "Live", cls: "bg-verified-50 text-verified-700 border-verified-100" },
  verified: { label: "Verified ✓", cls: "bg-verified-100 text-verified-700 border-verified-100" },
};

/** Every number in the app carries its provenance. */
export function DataTagBadge({ tag, className = "" }: { tag: DataTag; className?: string }) {
  const s = dataTagStyles[tag];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.cls} ${className}`}
      title={`This value is ${s.label.toLowerCase()} data`}
    >
      {s.label}
    </span>
  );
}

const productStateStyles: Record<ProductState, { label: string; cls: string }> = {
  locked: { label: "Locked", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  preview: { label: "Preview", cls: "bg-info-50 text-info-700 border-info-100" },
  eligible: { label: "Eligible", cls: "bg-info-50 text-info-700 border-info-100" },
  recommended: { label: "Recommended", cls: "bg-brand-100 text-brand-800 border-brand-200" },
  trial: { label: "Trial", cls: "bg-info-50 text-info-700 border-info-100" },
  onboarding: { label: "Onboarding", cls: "bg-attention-50 text-attention-700 border-attention-100" },
  active: { label: "Active", cls: "bg-verified-100 text-verified-700 border-verified-100" },
  completed: { label: "Completed", cls: "bg-verified-50 text-verified-700 border-verified-100" },
  suspended: { label: "Paused", cls: "bg-stone-100 text-stone-600 border-stone-200" },
  expired: { label: "Expired", cls: "bg-risk-50 text-risk-600 border-risk-100" },
  cancelled: { label: "Cancelled", cls: "bg-stone-100 text-stone-600 border-stone-200" },
};

export function ProductStateBadge({ state }: { state: ProductState }) {
  const s = productStateStyles[state];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "amber" | "red" | "blue" | "stone" | "brand";
}) {
  const tones = {
    green: "bg-verified-100 text-verified-700",
    amber: "bg-attention-100 text-attention-700",
    red: "bg-risk-100 text-risk-700",
    blue: "bg-info-100 text-info-700",
    stone: "bg-stone-100 text-stone-600",
    brand: "bg-brand-100 text-brand-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function HealthBadge({ health }: { health: SiteHealth }) {
  const map: Record<SiteHealth, { label: string; cls: string; dot: string }> = {
    good: { label: "Good", cls: "bg-verified-100 text-verified-700", dot: "bg-verified-500" },
    needs_attention: {
      label: "Needs attention",
      cls: "bg-attention-100 text-attention-700",
      dot: "bg-attention-500",
    },
    critical: { label: "Critical", cls: "bg-risk-100 text-risk-700", dot: "bg-risk-500" },
  };
  const s = map[health];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${s.cls}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const map: Record<Confidence, string> = {
    high: "bg-verified-50 text-verified-700",
    medium: "bg-attention-50 text-attention-700",
    low: "bg-stone-100 text-stone-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[level]}`}
      title="How confident WattZap is in this estimate"
    >
      {level} confidence
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  tone = "brand",
  className = "",
}: {
  value: number;
  max: number;
  tone?: "brand" | "green" | "amber";
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const tones = { brand: "bg-brand-500", green: "bg-verified-500", amber: "bg-attention-500" };
  return (
    <div
      className={`h-2 w-full rounded-full bg-stone-100 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
        <Info className="h-6 w-6 text-ink-muted" aria-hidden />
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-ink-muted mt-1 max-w-md mx-auto">{message}</p>
      {action ? (
        <Link href={action.href} className="btn-brand mt-4">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** Plain-language helper shown next to technical terms. */
export function TermHint({ term, hint }: { term: string; hint: string }) {
  return (
    <span className="underline decoration-dotted decoration-ink-faint cursor-help" title={hint}>
      {term}
    </span>
  );
}
