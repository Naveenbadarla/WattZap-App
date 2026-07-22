import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { actionsForSite, opportunitiesForSite } from "@/lib/db";
import { canCompleteAction } from "@/lib/permissions";
import { formatINR } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { ActionCard, OpportunityCard } from "@/components/domain";

export const metadata: Metadata = { title: "Opportunities" };

export default function OpportunitiesPage() {
  const { user, activeSite: site } = requireUser();
  const opportunities = opportunitiesForSite(site.id);
  const actions = actionsForSite(site.id);
  const open = opportunities.filter((o) => !["rejected", "closed", "verified"].includes(o.status));
  const settled = opportunities.filter((o) => ["rejected", "closed", "verified"].includes(o.status));
  const totalValue = open.reduce((t, o) => t + o.annualSaving, 0);

  return (
    <div>
      <PageHeader
        title="Savings opportunities"
        subtitle={
          open.length > 0
            ? `${open.length} open opportunities worth about ${formatINR(totalValue)}/year at ${site.shortName}. Every value shows whether it is estimated, measured or verified.`
            : `No open opportunities right now at ${site.shortName}.`
        }
      />

      {open.length === 0 && settled.length === 0 ? (
        <EmptyState
          title="No opportunities yet"
          message="Opportunities appear here after your EnergyScan assessment analyses your bills and meter data."
          action={{ href: "/products/energyscan-lite", label: "Start with EnergyScan" }}
        />
      ) : (
        <div className="space-y-4">
          {open.map((o) => (
            <OpportunityCard key={o.id} opp={o} />
          ))}
        </div>
      )}

      {actions.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold mb-3">Operational actions</h2>
          <div className="space-y-3">
            {actions.map((a) => (
              <ActionCard key={a.id} action={a} canComplete={canCompleteAction(user)} />
            ))}
          </div>
        </section>
      ) : null}

      {settled.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold mb-3">Completed &amp; closed</h2>
          <div className="space-y-4 opacity-90">
            {settled.map((o) => (
              <OpportunityCard key={o.id} opp={o} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
