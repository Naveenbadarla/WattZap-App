import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { Card, PageHeader, StatusPill } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const { user, activeSite: site, sites } = requireUser();
  const teammates = db().users.filter((u) => u.orgId === user.orgId && u.id !== user.id);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" subtitle="Your profile, team, notifications and language." />

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="font-bold mb-3">Your profile</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-ink-muted">Name</dt><dd className="font-semibold">{user.name}</dd></div>
            <div><dt className="text-xs text-ink-muted">Email</dt><dd className="font-semibold">{user.email}</dd></div>
            <div><dt className="text-xs text-ink-muted">Role</dt><dd className="font-semibold">{ROLE_LABELS[user.role]}</dd></div>
            <div><dt className="text-xs text-ink-muted">Phone</dt><dd className="font-semibold">{user.phone ?? "—"}</dd></div>
          </dl>
          <p className="text-xs text-ink-faint mt-3">
            Password reset and email verification run through the production auth provider
            (Supabase Auth) — stubbed in this demo.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-3">Notification preferences</h2>
          <form className="space-y-3">
            {[
              { id: "inapp", label: "In-app notifications", checked: true, disabled: true },
              { id: "email", label: "Email alerts", checked: true, disabled: false },
              { id: "whatsapp", label: "WhatsApp alerts (critical & action-required only)", checked: true, disabled: false },
              { id: "sms", label: "SMS alerts (where configured)", checked: false, disabled: false },
            ].map((n) => (
              <label key={n.id} className="flex items-center gap-3 text-sm" htmlFor={`pref-${n.id}`}>
                <input
                  id={`pref-${n.id}`}
                  type="checkbox"
                  defaultChecked={n.checked}
                  disabled={n.disabled}
                  className="h-5 w-5 rounded border-stone-300 accent-amber-500"
                />
                {n.label}
              </label>
            ))}
            <p className="text-xs text-ink-faint">
              Preferences save in production; WhatsApp/SMS delivery integrates via the notifications
              service (see README roadmap).
            </p>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-3">Language</h2>
          <div className="flex flex-wrap gap-2">
            <StatusPill label="English (current)" tone="brand" />
            <StatusPill label="Simple English mode — available" tone="blue" />
            <StatusPill label="हिन्दी — coming soon" tone="stone" />
            <StatusPill label="తెలుగు — coming soon" tone="stone" />
          </div>
          <p className="text-xs text-ink-faint mt-3">
            The interface is built on a translation layer so regional languages can be added without
            code changes.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-3">Your team</h2>
          <ul className="divide-y divide-stone-100">
            {teammates.map((t) => (
              <li key={t.id} className="py-2.5 flex items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-ink-muted">{t.email}</p>
                </div>
                <StatusPill label={ROLE_LABELS[t.role]} tone="stone" />
              </li>
            ))}
          </ul>
          <button type="button" className="btn-secondary mt-3 text-sm" title="Invite flow is stubbed in the demo">
            Invite a colleague
          </button>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-3">Sites you can access</h2>
          <ul className="text-sm space-y-1.5">
            {sites.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.id === site.id ? "bg-brand-500" : "bg-stone-300"}`} aria-hidden />
                {s.name} — {s.location}
                {s.id === site.id ? <span className="text-xs text-ink-faint">(active)</span> : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-2">Data &amp; trust</h2>
          <ul className="text-sm text-ink-soft space-y-1.5">
            <li>• Your data belongs to your organisation and is isolated from every other customer.</li>
            <li>• Every number shows whether it is historical, uploaded, estimated, simulated, live or verified.</li>
            <li>• Every approval, upload and verification is recorded in an audit trail.</li>
            <li>• Exports and downloads follow your role permissions.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
