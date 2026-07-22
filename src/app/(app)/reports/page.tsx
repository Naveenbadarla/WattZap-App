import type { Metadata } from "next";
import { Download, Eye } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { reportsForSite } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Card, DataTagBadge, EmptyState, PageHeader, StatusPill } from "@/components/ui";

export const metadata: Metadata = { title: "Reports" };

const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "stone"> = {
  final: "green",
  in_review: "amber",
  draft: "stone",
  generating: "blue",
};

export default function ReportsPage() {
  const { activeSite: site } = requireUser();
  const reports = reportsForSite(site.id);

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle={`Assessment, performance and verification reports for ${site.shortName}. Draft reports are clearly marked and never final numbers.`}
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports yet"
          message="Your first report is generated when EnergyScan completes. Monthly performance reports follow once monitoring products are active."
          action={{ href: "/products/energyscan-lite", label: "Start with EnergyScan" }}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <StatusPill label={r.status === "in_review" ? "In review" : r.status[0].toUpperCase() + r.status.slice(1)} tone={STATUS_TONE[r.status] ?? "stone"} />
                    <DataTagBadge tag={r.dataTag} />
                    <span className="text-xs text-ink-faint">{r.version}</span>
                  </div>
                  <h2 className="font-bold">{r.title}</h2>
                  <p className="text-sm text-ink-muted mt-0.5">{r.summary}</p>
                  <p className="text-xs text-ink-faint mt-1.5">
                    Period: {r.period} · Generated {formatDate(r.generatedOn)}
                    {r.reviewer ? ` · Reviewed by ${r.reviewer}` : ""}
                    {r.approvedBy ? ` · Approved by ${r.approvedBy}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" className="btn-secondary !min-h-[38px] !py-1.5 text-sm" title="Preview (demo)">
                    <Eye className="h-4 w-4" aria-hidden /> Preview
                  </button>
                  <button
                    type="button"
                    className="btn-secondary !min-h-[38px] !py-1.5 text-sm"
                    disabled={r.status !== "final"}
                    title={r.status === "final" ? "Download PDF (demo)" : "Available when final"}
                  >
                    <Download className="h-4 w-4" aria-hidden /> PDF
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs text-ink-faint mt-6">
        PDF generation is stubbed in this demo build — the production service renders these reports
        server-side with version history and approval workflow.
      </p>
    </div>
  );
}
