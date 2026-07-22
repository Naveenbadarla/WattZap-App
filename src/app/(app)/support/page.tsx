import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { Card, PageHeader, StatusPill } from "@/components/ui";
import { SupportForm } from "./support-form";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  const { user, activeSite: site } = requireUser();
  const requests = db()
    .supportRequests.filter((r) => r.siteId === site.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Support"
        subtitle="Your WattZap customer success team responds within one working day — faster for critical alerts."
      />

      <Card className="p-5 mb-4 bg-brand-50/60 border-brand-200">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Phone className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-bold text-sm">Prefer to talk?</p>
            <p className="text-sm text-ink-soft">
              Call your customer success manager: <strong>+91 40 4855 0000</strong> (Mon–Sat, 9:00–19:00)
            </p>
          </div>
        </div>
      </Card>

      <SupportForm />

      {requests.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-bold mb-3">Your requests</h2>
          <div className="space-y-2">
            {requests.map((r) => {
              const requester = db().users.find((u) => u.id === r.userId);
              return (
                <Card key={r.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{r.subject}</p>
                    <StatusPill
                      label={r.status === "open" ? "Open" : r.status === "in_progress" ? "In progress" : "Resolved"}
                      tone={r.status === "resolved" ? "green" : r.status === "in_progress" ? "amber" : "blue"}
                    />
                  </div>
                  <p className="text-sm text-ink-muted mt-1">{r.message}</p>
                  <p className="text-xs text-ink-faint mt-1.5">
                    {requester?.name ?? "You"} · {formatDate(r.createdAt)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-ink-faint mt-6">
        Signed in as {user.name}. Requests are linked to {site.name}.
      </p>
    </div>
  );
}
