import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleDashed, Loader2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { onboardingForSite } from "@/lib/db";
import { Card, PageHeader, ProgressBar } from "@/components/ui";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  const { activeSite: site } = requireUser();
  const steps = onboardingForSite(site.id);
  const done = steps.filter((s) => s.status === "done").length;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Getting set up"
        subtitle={`${done} of ${steps.length} steps complete for ${site.shortName}. You can save and continue later at any time — and WattZap staff can complete steps with you over a call.`}
      />

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Progress</p>
          <p className="text-sm text-ink-muted">{Math.round((done / steps.length) * 100)}%</p>
        </div>
        <ProgressBar value={done} max={steps.length} />
      </Card>

      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.id}>
            <Card className={`p-4 ${s.status === "in_progress" ? "border-attention-500/50" : ""}`}>
              <div className="flex items-start gap-3">
                {s.status === "done" ? (
                  <CircleCheck className="h-6 w-6 text-verified-600 shrink-0" aria-hidden />
                ) : s.status === "in_progress" ? (
                  <Loader2 className="h-6 w-6 text-attention-600 shrink-0" aria-hidden />
                ) : (
                  <CircleDashed className="h-6 w-6 text-stone-300 shrink-0" aria-hidden />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${s.status === "pending" ? "text-ink-faint" : ""}`}>
                    {s.step}. {s.title}
                  </p>
                  <p className="text-sm text-ink-muted mt-0.5">{s.description}</p>
                  {s.valueMessage ? (
                    <p className="mt-2 rounded-lg bg-verified-50 border border-verified-100 px-3 py-2 text-sm text-verified-700">
                      {s.valueMessage}
                    </p>
                  ) : null}
                  {s.status === "in_progress" && s.title.includes("bill") ? (
                    <Link href="/documents" className="btn-brand !min-h-[38px] !py-1.5 text-sm mt-2">
                      Upload bills now
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <p className="text-xs text-ink-faint mt-6">
        Every completed step gives you something immediately — you never have to finish the whole
        list before seeing value.
      </p>
    </div>
  );
}
