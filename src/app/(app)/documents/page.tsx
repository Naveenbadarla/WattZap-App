import type { Metadata } from "next";
import { FileSpreadsheet, FileText, Image as ImageIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { documentsForSite } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { UploadForm } from "./upload-form";
import { CATEGORY_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  const { activeSite: site } = requireUser();
  const docs = documentsForSite(site.id);
  const categories = Array.from(new Set(docs.map((d) => d.category)));

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle={`Bills, meter files, evidence and agreements for ${site.shortName}. Uploading a bill immediately queues it for analysis.`}
      />

      <UploadForm />

      {docs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No documents yet"
            message="Start by uploading a recent electricity bill — WattZap analyses it and shows you the first findings within a day."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted mb-2">
                {CATEGORY_LABELS[cat]}
              </h2>
              <Card className="divide-y divide-stone-100 !p-0">
                {docs
                  .filter((d) => d.category === cat)
                  .map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-3.5">
                      {d.fileType === "xlsx" || d.fileType === "csv" ? (
                        <FileSpreadsheet className="h-5 w-5 text-verified-600 shrink-0" aria-hidden />
                      ) : d.fileType === "image" ? (
                        <ImageIcon className="h-5 w-5 text-info-600 shrink-0" aria-hidden />
                      ) : (
                        <FileText className="h-5 w-5 text-risk-500 shrink-0" aria-hidden />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{d.name}</p>
                        <p className="text-xs text-ink-muted">
                          Uploaded by {d.uploadedBy} on {formatDate(d.uploadedOn)}
                          {d.sizeKb > 0 ? ` · ${d.sizeKb} KB` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
