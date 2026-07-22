import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, CircleDashed, Loader2, Lock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  billsForSite,
  demandEventsForSite,
  getSite,
  milestonesFor,
  opportunitiesForSite,
  pfEventsForSite,
  reportsForSite,
  savingsForSite,
  todProfileForSite,
} from "@/lib/db";
import { getEntitlement } from "@/lib/entitlements";
import { canActivateProduct, ROLE_LABELS } from "@/lib/permissions";
import { requestActivationAction } from "@/lib/actions";
import { formatINR, formatINRFull, formatMonth } from "@/lib/format";
import { Card, DataTagBadge, PageHeader, ProductStateBadge } from "@/components/ui";
import { AppIcon } from "@/components/icons";
import { OpportunityCard } from "@/components/domain";
import { BillTrendChart, DemandTrendChart, PfTrendChart, TodProfileChart } from "@/components/charts";
import { PRODUCTS } from "@/lib/data/products";
import type { OnboardingMilestone, ProductSlug } from "@/lib/types";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = PRODUCTS.find((x) => x.slug === params.slug);
  return { title: p ? p.name : "Product" };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { user, activeSite: site } = await requireUser();
  const pwe = await getEntitlement(site.id, params.slug as ProductSlug);
  if (!pwe) notFound();
  const { def, entitlement: ent } = pwe;
  const locked = ent.state === "locked";
  const canActivate =
    ["eligible", "recommended"].includes(ent.state) && canActivateProduct(user);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={def.name}
        subtitle={def.tagline}
        action={<ProductStateBadge state={ent.state} />}
      />

      {/* State banner — a locked product is never a dead end */}
      <Card className={`p-5 ${locked ? "bg-stone-50" : ent.state === "recommended" ? "bg-brand-50/60 border-brand-200" : ""}`}>
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${locked ? "bg-stone-200 text-stone-500" : "bg-brand-100 text-brand-700"}`}>
            {locked ? <Lock className="h-5 w-5" aria-hidden /> : <AppIcon name={def.icon} />}
          </span>
          <div className="flex-1">
            <p className="text-sm text-ink-soft">{ent.stateReason}</p>
            {ent.estimatedAnnualValue ? (
              <p className="text-sm mt-1.5">
                Expected value:{" "}
                <strong className="text-verified-600">{formatINR(ent.estimatedAnnualValue)}/year</strong>{" "}
                <span className="text-xs text-ink-faint">(estimated)</span>
              </p>
            ) : null}
            {ent.unlockSteps.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1">
                  {locked ? "How to unlock" : "What happens next"}
                </p>
                <ol className="text-sm text-ink-soft space-y-1 list-decimal list-inside">
                  {ent.unlockSteps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {canActivate ? (
                <form action={requestActivationAction}>
                  <input type="hidden" name="siteId" value={site.id} />
                  <input type="hidden" name="product" value={def.slug} />
                  <button type="submit" className="btn-brand">
                    {ent.state === "recommended" ? "Accept recommendation & start onboarding" : "Request activation"}
                  </button>
                </form>
              ) : ["eligible", "recommended"].includes(ent.state) ? (
                <p className="text-xs text-ink-muted self-center">
                  Activation needs the Business Owner or Finance user (you are signed in as {ROLE_LABELS[user.role]}).
                </p>
              ) : null}
              <Link href="/support" className="btn-secondary">Ask a question</Link>
            </div>
            <p className="text-xs text-ink-faint mt-2">
              Commercial model: {def.commercialModel}. Nothing is charged without a written proposal you approve.
            </p>
          </div>
        </div>
      </Card>

      {/* What the product does — always visible, even when locked */}
      <Card className="mt-4 p-5">
        <h2 className="font-bold mb-2">What {def.name} does</h2>
        <p className="text-sm text-ink-soft mb-3">{def.description}</p>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-ink-soft">
          {def.whatItDoes.map((w) => (
            <li key={w} className="flex gap-2">
              <CircleCheck className="h-4 w-4 mt-0.5 text-verified-600 shrink-0" aria-hidden />
              {w}
            </li>
          ))}
        </ul>
      </Card>

      {/* Module content by product */}
      <ModuleContent slug={def.slug} siteId={site.id} state={ent.state} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function ModuleContent({ slug, siteId, state }: { slug: ProductSlug; siteId: string; state: string }) {
  switch (slug) {
    case "energyscan-lite":
    case "energyscan-pro":
      return <EnergyScanModule siteId={siteId} slug={slug} />;
    case "pf-guard":
      return <PfGuardModule siteId={siteId} />;
    case "demand-guard":
      return <DemandGuardModule siteId={siteId} />;
    case "bill-guard":
      return <BillGuardModule siteId={siteId} />;
    case "ems-lite":
    case "wattzap-edge":
      return <EmsModule siteId={siteId} />;
    case "solarfit":
      return <SolarFitModule siteId={siteId} state={state} />;
    case "solarlease":
      return <SolarLeaseModule />;
    case "savings-assurance":
      return <SavingsAssuranceModule siteId={siteId} />;
    default:
      return null;
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold mt-8 mb-3">{children}</h2>;
}

function MilestoneList({ milestones }: { milestones: OnboardingMilestone[] }) {
  return (
    <ol className="space-y-0">
      {milestones.map((m, i) => (
        <li key={m.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {m.status === "done" ? (
              <CircleCheck className="h-6 w-6 text-verified-600" aria-hidden />
            ) : m.status === "in_progress" ? (
              <Loader2 className="h-6 w-6 text-attention-600" aria-hidden />
            ) : (
              <CircleDashed className="h-6 w-6 text-stone-300" aria-hidden />
            )}
            {i < milestones.length - 1 ? <span className="w-px flex-1 bg-stone-200 my-1" aria-hidden /> : null}
          </div>
          <div className="pb-5">
            <p className={`font-semibold text-sm ${m.status === "pending" ? "text-ink-faint" : ""}`}>
              {m.step}. {m.title}
              {m.status === "in_progress" ? <span className="text-attention-700"> — in progress</span> : null}
            </p>
            {m.date ? <p className="text-xs text-ink-muted">{m.date}</p> : null}
            {m.note ? <p className="text-xs text-ink-muted">{m.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- EnergyScan ----------

async function EnergyScanModule({ siteId, slug }: { siteId: string; slug: string }) {
  const [bills, allOpps, allReports, site, todProfile] = await Promise.all([
    billsForSite(siteId),
    opportunitiesForSite(siteId),
    reportsForSite(siteId),
    getSite(siteId),
    todProfileForSite(siteId),
  ]);
  const opps = allOpps.filter((o) => !["rejected", "closed"].includes(o.status));
  const reports = allReports.filter((r) => r.type.startsWith("EnergyScan"));
  const isPro = slug === "energyscan-pro";
  const infoComplete = bills.length >= 12 ? 100 : 55;
  const billTarget = 12;

  return (
    <>
      <SectionTitle>Assessment status</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Information completed</p>
          <p className="text-xl font-bold mt-1">{infoComplete}%</p>
          {infoComplete < 100 ? (
            <Link href="/onboarding" className="text-xs font-semibold underline">Complete your profile</Link>
          ) : <p className="text-[11px] text-ink-faint">Site profile complete</p>}
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Bills uploaded</p>
          <p className="text-xl font-bold mt-1">{bills.length} / {billTarget}</p>
          <p className="text-[11px] text-ink-faint">{bills.length >= billTarget ? "Full year available" : "12 months unlock EnergyScan Pro"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Opportunities found</p>
          <p className="text-xl font-bold mt-1">{opps.length}</p>
          <p className="text-[11px] text-ink-faint">
            worth ~{formatINR(opps.reduce((t, o) => t + o.annualSaving, 0))}/yr (estimated)
          </p>
        </Card>
      </div>

      {bills.length > 0 ? (
        <>
          <SectionTitle>Monthly bill trend</SectionTitle>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-ink-muted">Total bill amount by month. Red bars had anomalies or penalties.</p>
              <DataTagBadge tag="uploaded" />
            </div>
            <BillTrendChart data={bills.map((b) => ({ month: b.month, amount: b.amount, flagged: b.anomalies.length > 0 }))} />
          </Card>
        </>
      ) : null}

      {isPro && todProfile.length > 0 ? (
        <>
          <SectionTitle>Typical day — when your site uses power</SectionTitle>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-ink-muted">Built from your uploaded MRI meter files (historical, not live).</p>
              <DataTagBadge tag="historical" />
            </div>
            <TodProfileChart data={todProfile} />
            <p className="text-xs text-ink-muted mt-2">
              The 10:00 peak is where demand spikes happen — see the dryer start-time opportunity.
            </p>
          </Card>
        </>
      ) : null}

      <SectionTitle>Key findings</SectionTitle>
      <div className="space-y-4">
        {opps.slice(0, 4).map((o) => <OpportunityCard key={o.id} opp={o} />)}
      </div>

      {reports.length > 0 ? (
        <>
          <SectionTitle>Reports</SectionTitle>
          <div className="space-y-2">
            {reports.map((r) => (
              <Card key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{r.title}</p>
                  <p className="text-xs text-ink-muted">{r.period} · {r.version} · {r.status}</p>
                </div>
                <Link href="/reports" className="btn-secondary !min-h-[38px] !py-1.5 text-sm">View</Link>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {site && site.dataReadiness === "historical_interval" ? (
        <Card className="mt-6 p-5 bg-brand-50/60 border-brand-200">
          <p className="text-sm">
            <strong>Recommended next step:</strong> EMS Lite live monitoring is in onboarding — it will
            catch penalties as they happen instead of after the bill arrives.{" "}
            <Link href="/products/ems-lite" className="font-semibold underline">Track onboarding</Link>
          </p>
        </Card>
      ) : null}
    </>
  );
}

// ---------- PF Guard ----------

async function PfGuardModule({ siteId }: { siteId: string }) {
  const events = await pfEventsForSite(siteId);
  const verifiedSaving = (await savingsForSite(siteId)).find(
    (s) => s.product === "pf-guard" && s.verifiedAnnual
  );
  if (events.length === 0) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-ink-muted">
          No power-factor data is available for this site yet. Upload bills or complete EnergyScan to see PF analysis here.
        </p>
      </Card>
    );
  }
  const penaltyMonths = events.filter((e) => e.penalty > 0);
  const totalPenalty = penaltyMonths.reduce((t, e) => t + e.penalty, 0);
  const latest = events[events.length - 1];
  const best = events.reduce((a, b) => (b.avgPf > a.avgPf ? b : a));
  const worst = events.reduce((a, b) => (b.avgPf < a.avgPf ? b : a));

  return (
    <>
      <SectionTitle>Power factor — last 12 months</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Latest month" value={latest.avgPf.toFixed(2)} sub={formatMonth(latest.month)} />
        <Stat label="Best month" value={best.avgPf.toFixed(2)} sub={formatMonth(best.month)} />
        <Stat label="Worst month" value={worst.avgPf.toFixed(2)} sub={formatMonth(worst.month)} tone="risk" />
        <Stat label="Penalties paid (12 mo)" value={formatINRFull(totalPenalty)} sub={`${penaltyMonths.length} months`} tone="risk" />
      </div>
      <Card className="p-5 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-ink-muted">
            In plain words: below the 0.90 line, your site used electricity inefficiently and the
            electricity board charged a penalty.
          </p>
          <DataTagBadge tag="historical" />
        </div>
        <PfTrendChart data={events.map((e) => ({ month: e.month, avgPf: e.avgPf, penalty: e.penalty }))} />
      </Card>

      <SectionTitle>Penalty periods &amp; causes</SectionTitle>
      <div className="space-y-2">
        {penaltyMonths.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{formatMonth(e.month)} — worst PF {e.worstPf.toFixed(2)} ({e.worstWindow})</p>
                <p className="text-xs text-ink-muted mt-0.5">Likely cause: {e.likelyCause}</p>
              </div>
              <p className="font-bold text-risk-600">{formatINRFull(e.penalty)}</p>
            </div>
          </Card>
        ))}
      </div>

      {verifiedSaving ? (
        <Card className="mt-6 p-5 bg-verified-50/60 border-verified-100">
          <h3 className="font-bold text-sm mb-1">Verified result</h3>
          <p className="text-sm text-ink-soft">
            {verifiedSaving.title}. Verified saving:{" "}
            <strong className="text-verified-700">
              {formatINR(verifiedSaving.verifiedAnnual!)}/year
            </strong>
            .{" "}
            <Link href={`/savings/${verifiedSaving.id}`} className="font-semibold underline">
              See the calculation
            </Link>
          </p>
          <p className="text-xs text-ink-muted mt-2">
            Ongoing action: weekly APFC indicator check by the maintenance team until three clean
            months pass.
          </p>
        </Card>
      ) : null}
    </>
  );
}

// ---------- Demand Guard ----------

async function DemandGuardModule({ siteId }: { siteId: string }) {
  const [site, events, bills, opps] = await Promise.all([
    getSite(siteId),
    demandEventsForSite(siteId),
    billsForSite(siteId),
    opportunitiesForSite(siteId),
  ]);
  const demandOpp = opps.find((o) => o.product === "demand-guard");
  if (!site) return null;
  if (events.length === 0) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-ink-muted">
          Demand analysis needs 12 months of bills or interval meter data. Upload data to see your demand profile here.
        </p>
      </Card>
    );
  }
  const totalCost = events.reduce((t, e) => t + e.estimatedCost, 0);

  return (
    <>
      <SectionTitle>Demand vs your limits</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Sanctioned demand" value={`${site.sanctionedDemandKva} kVA`} sub="DISCOM limit" />
        <Stat label="Contracted demand" value={`${site.contractDemandKva} kVA`} sub="You pay for this monthly" />
        <Stat label="Spikes (last 90 days)" value={String(events.length)} sub="above contracted" tone="risk" />
        <Stat label="Est. avoidable cost" value={formatINRFull(totalCost)} sub="last 90 days (estimated)" tone="risk" />
      </div>

      <Card className="p-5 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-ink-muted">
            Recorded maximum demand by month. Red bars exceeded your contracted 450 kVA — several
            machines operated together and created a demand spike.
          </p>
          <DataTagBadge tag="uploaded" />
        </div>
        <DemandTrendChart
          data={bills.map((b) => ({ month: b.month, recordedMdKva: b.recordedMdKva }))}
          contracted={site.contractDemandKva}
          sanctioned={site.sanctionedDemandKva}
        />
      </Card>

      <SectionTitle>Demand-spike timeline</SectionTitle>
      <div className="space-y-2">
        {events.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">
                  {e.date} at {e.time} — {e.peakKva} kVA for {e.durationMin} min
                </p>
                <p className="text-xs text-ink-muted mt-0.5">Likely cause: {e.likelyCause}</p>
              </div>
              <p className="font-bold text-attention-700">~{formatINRFull(e.estimatedCost)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5 bg-brand-50/60 border-brand-200">
        <p className="text-sm">
          <strong>Operational recommendation:</strong> shift the dryer start time by 20 minutes
          (already being measured) and, after three clean months, reduce contracted demand to 420 kVA.{" "}
          <Link
            href={demandOpp ? `/opportunities/${demandOpp.id}` : "/opportunities"}
            className="font-semibold underline"
          >
            View the action
          </Link>
        </p>
      </Card>
    </>
  );
}

// ---------- Bill Guard ----------

async function BillGuardModule({ siteId }: { siteId: string }) {
  const bills = [...(await billsForSite(siteId))].reverse();
  const billOpp = (await opportunitiesForSite(siteId)).find((o) => o.product === "bill-guard");
  if (bills.length === 0) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-ink-muted">No bills uploaded yet. Upload your first electricity bill to start validation.</p>
      </Card>
    );
  }
  return (
    <>
      <SectionTitle>Bill-by-bill validation</SectionTitle>
      <div className="space-y-2">
        {bills.map((b) => (
          <Card key={b.id} className={`p-4 ${b.anomalies.length > 0 ? "border-attention-500/40" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-sm">{formatMonth(b.month)} — {formatINRFull(b.amount)}</p>
                <p className="text-xs text-ink-muted mt-0.5">
                  {b.unitsKwh.toLocaleString("en-IN")} kWh · MD {b.recordedMdKva} kVA · PF {b.powerFactor.toFixed(2)} · Bill {b.billNumber}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DataTagBadge tag={b.dataTag} />
                {b.anomalies.length > 0 ? (
                  <span className="text-xs font-bold text-attention-700">{b.anomalies.length} finding{b.anomalies.length > 1 ? "s" : ""}</span>
                ) : (
                  <span className="text-xs font-semibold text-verified-600">Clean ✓</span>
                )}
              </div>
            </div>
            {b.anomalies.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                {b.anomalies.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-attention-600 mt-0.5">•</span>{a}
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
      </div>
      {billOpp ? (
        <Card className="mt-6 p-5 bg-brand-50/60 border-brand-200">
          <p className="text-sm">
            <strong>Money to recover:</strong> {billOpp.plainExplanation}{" "}
            <Link href={`/opportunities/${billOpp.id}`} className="font-semibold underline">
              Authorise the review request
            </Link>
          </p>
        </Card>
      ) : null}
    </>
  );
}

// ---------- EMS Lite / WattZap Edge ----------

async function EmsModule({ siteId }: { siteId: string }) {
  const milestones = await milestonesFor(siteId, "ems-lite");
  return (
    <>
      <SectionTitle>Live site data</SectionTitle>
      <Card className="p-6 text-center bg-stone-50">
        <p className="font-semibold">No live meter data is connected yet.</p>
        <p className="text-sm text-ink-muted mt-1 max-w-xl mx-auto">
          You can still view your historical EnergyScan findings, or continue EMS Lite onboarding
          below. Once WattZap Edge is installed, this page shows live energy use, demand, power
          factor, data freshness and meter health.
        </p>
        <div className="mt-3 flex justify-center gap-2">
          <Link href="/products/energyscan-pro" className="btn-secondary !min-h-[40px] !py-2 text-sm">
            View historical findings
          </Link>
        </div>
      </Card>

      {milestones.length > 0 ? (
        <>
          <SectionTitle>Onboarding tracker</SectionTitle>
          <Card className="p-5">
            <MilestoneList milestones={milestones} />
            <p className="text-xs text-ink-faint">
              WattZap handles the survey, configuration and installation. Your team only needs to host
              the site visit on 29 Jul.
            </p>
          </Card>
        </>
      ) : null}
    </>
  );
}

// ---------- SolarFit ----------

async function SolarFitModule({ siteId, state }: { siteId: string; state: string }) {
  const site = await getSite(siteId);
  const solarOpp = (await opportunitiesForSite(siteId)).find((o) => o.product === "solarfit");
  if (!site || state === "locked") return null;
  const scenarios = [
    { size: "100 kW", gen: "1.46 lakh kWh/yr", self: "98%", saving: "₹9.6 lakh/yr", capex: "₹36 lakh", payback: "3.8 yrs" },
    { size: "150 kW (recommended)", gen: "2.19 lakh kWh/yr", self: "94%", saving: "₹14.2 lakh/yr", capex: "₹52 lakh", payback: "3.7 yrs" },
    { size: "200 kW", gen: "2.92 lakh kWh/yr", self: "81%", saving: "₹17.1 lakh/yr", capex: "₹68 lakh", payback: "4.0 yrs" },
  ];
  return (
    <>
      <SectionTitle>Draft recommendation — 150 kW rooftop</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Recommended size" value="150 kW" sub={`Roof available: ${site.roofAreaSqft?.toLocaleString("en-IN")} sq ft`} />
        <Stat label="Existing solar" value={`${site.solarInstalledKw} kW`} sub="none installed" />
        <Stat label="Self-consumption" value="94%" sub="used on-site, not exported" />
        <Stat label="Payback" value="≈ 3.7 yrs" sub="simple payback (estimated)" />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Sizing scenarios</h3>
          <DataTagBadge tag="estimated" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-muted border-b border-stone-200">
                <th className="py-2 pr-4">Size</th>
                <th className="py-2 pr-4">Annual generation</th>
                <th className="py-2 pr-4">Self-use</th>
                <th className="py-2 pr-4">Saving</th>
                <th className="py-2 pr-4">Investment</th>
                <th className="py-2">Payback</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.size} className={`border-b border-stone-100 ${s.size.includes("recommended") ? "bg-brand-50/60 font-semibold" : ""}`}>
                  <td className="py-2.5 pr-4">{s.size}</td>
                  <td className="py-2.5 pr-4">{s.gen}</td>
                  <td className="py-2.5 pr-4">{s.self}</td>
                  <td className="py-2.5 pr-4">{s.saving}</td>
                  <td className="py-2.5 pr-4">{s.capex}</td>
                  <td className="py-2.5">{s.payback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          Why 150 kW: it matches your daytime load so almost every unit is used on-site. Larger
          systems export more at low rates and pay back slower.
        </p>
      </Card>

      <details className="card p-5 mt-4">
        <summary className="font-bold cursor-pointer text-sm">Key assumptions</summary>
        <ul className="text-sm text-ink-soft mt-2 space-y-1">
          <li>• Generation: 4.0 kWh/kWp/day annual average for Nizamabad, monsoon months modelled at 55–65%.</li>
          <li>• Tariff: current HT rate with 3% annual escalation.</li>
          <li>• Degradation: 0.7%/year. O&amp;M included in payback.</li>
          <li>• All figures are estimates until the structural survey and final design.</li>
        </ul>
      </details>

      <Card className="mt-4 p-5 bg-brand-50/60 border-brand-200">
        <p className="text-sm">
          <strong>Next step:</strong> review this draft with WattZap&apos;s solar engineer, then decide
          between direct purchase and SolarLease (subject to approval).{" "}
          <Link
            href={solarOpp ? `/opportunities/${solarOpp.id}` : "/opportunities"}
            className="font-semibold underline"
          >
            Open the decision card
          </Link>
        </p>
      </Card>
    </>
  );
}

// ---------- SolarLease ----------

function SolarLeaseModule() {
  const steps = [
    { title: "SolarFit recommendation reviewed", status: "in_progress" as const, note: "Draft under customer review" },
    { title: "Commercial & credit review", status: "pending" as const },
    { title: "Site assessment", status: "pending" as const },
    { title: "WattZap internal approval", status: "pending" as const },
    { title: "Agreement & installation milestones", status: "pending" as const },
  ];
  return (
    <>
      <SectionTitle>Eligibility process</SectionTitle>
      <Card className="p-5">
        <MilestoneList milestones={steps.map((s, i) => ({ id: `sl-${i}`, siteId: "", product: "solarlease", step: i + 1, title: s.title, status: s.status, note: s.note }))} />
        <p className="text-xs text-ink-muted">
          SolarLease is never automatic — it follows commercial review, credit eligibility, a site
          assessment and internal WattZap approval. Indicative structure: little or no upfront
          payment, fixed monthly payment below your expected energy saving, so your net monthly
          benefit stays positive.
        </p>
      </Card>
    </>
  );
}

// ---------- Savings Assurance ----------

async function SavingsAssuranceModule({ siteId }: { siteId: string }) {
  const milestones = await milestonesFor(siteId, "savings-assurance");
  const verified = (await savingsForSite(siteId)).filter((s) => s.verifiedAnnual);
  return (
    <>
      {verified.length > 0 ? (
        <>
          <SectionTitle>Verified savings</SectionTitle>
          <div className="space-y-2">
            {verified.map((v) => (
              <Card key={v.id} className="p-4 bg-verified-50/50 border-verified-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{v.title}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Verified by {v.wattzapReviewer} · approved by {v.customerApprover}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-verified-700">{formatINR(v.verifiedAnnual!)}/yr ✓</p>
                    <Link href={`/savings/${v.id}`} className="text-xs font-semibold underline">
                      Full calculation &amp; audit trail
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      {milestones.length > 0 ? (
        <>
          <SectionTitle>Baseline preparation</SectionTitle>
          <Card className="p-5">
            <MilestoneList milestones={milestones} />
            <p className="text-xs text-ink-muted">
              The baseline is the agreed “before” picture. Once you approve it, every future saving is
              measured against it — with fair adjustments for production changes, and full evidence.
            </p>
          </Card>
        </>
      ) : null}
    </>
  );
}

// ---------- shared stat ----------

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "risk" }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`text-xl font-bold mt-1 ${tone === "risk" ? "text-risk-600" : ""}`}>{value}</p>
      {sub ? <p className="text-[11px] text-ink-faint">{sub}</p> : null}
    </Card>
  );
}
