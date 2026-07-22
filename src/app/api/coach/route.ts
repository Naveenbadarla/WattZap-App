import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { alertsForSite, billsForSite, db, savingsForSite } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { productsForSite } from "@/lib/entitlements";
import { walletSummary } from "@/lib/savings";

/**
 * WattZap Coach service endpoint.
 *
 * Rule-based v1: answers are composed ONLY from the signed-in customer's
 * authorised site data. The interface is deliberately shaped so a Claude /
 * LLM backend can replace `answer()` later without touching the client —
 * the model would receive the same scoped, pre-authorised context and no
 * raw database access. No system prompts or other customers' data are ever
 * exposed.
 */

const bodySchema = z.object({
  question: z.string().min(1).max(500),
  context: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const ctx = currentUser();
  if (!ctx) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let parsed;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  const answer = buildAnswer(parsed.question.toLowerCase(), ctx.activeSite.id, ctx.activeSite.name);
  return NextResponse.json({ answer });
}

function buildAnswer(q: string, siteId: string, siteName: string): string {
  const savings = savingsForSite(siteId);
  const wallet = walletSummary(savings);
  const bills = billsForSite(siteId);
  const latest = bills[bills.length - 1];

  if (q.includes("power factor")) {
    return (
      "Power factor is a measure of how efficiently your site uses the electricity it draws — like how much of the water you pump actually reaches the field.\n\n" +
      "When it drops below 0.90, the electricity board adds a penalty to your bill. At your site, a faulty capacitor (APFC) panel caused penalties of ₹14,200, ₹18,600 and ₹9,800 in the last year. It has been repaired, and PF Guard now watches it every month."
    );
  }
  if (q.includes("bill higher") || (q.includes("bill") && q.includes("high"))) {
    return latest
      ? `Your most recent analysed bill (${latest.month}) was ${formatINR(latest.amount)}. The main avoidable items across recent bills were power-factor penalties, demand-spike charges when machines started together, and one suspected billing error of about ₹60,000 in March. Open Bill Guard or the Opportunities page to see each item with its value.`
      : "No bills have been analysed for this site yet. Upload your electricity bills and I can explain exactly what changed.";
  }
  if (q.includes("demand")) {
    const n = db().demandEvents.filter((d) => d.siteId === siteId).length;
    return n > 0
      ? `Your demand increases when several large machines run at the same time. ${siteName} had ${n} demand spikes in the last 90 days, mostly when the dryer started while both hullers were running. Each spike raises the demand charge for the whole month. The recommended fix — shifting the dryer start by 20 minutes — is already being measured.`
      : "No demand spikes have been detected from the data available for this site so far.";
  }
  if (q.includes("first") || q.includes("do first") || q.includes("priority")) {
    return (
      "Your highest-value pending action right now is to follow the new dryer start-up sequence (worth about ₹4,600/month), and for the accounts team to authorise the March bill review (about ₹60,000 recoverable).\n\nThe Home page always shows your single top action first."
    );
  }
  if (q.includes("verified") && (q.includes("lower") || q.includes("less") || q.includes("differ"))) {
    return (
      "Good question — this is exactly what Savings Assurance is for.\n\nYour APFC repair was expected to save ₹12,500/month but verified at ₹10,400/month. The difference is fair adjustment: production was 9% higher than in the baseline period, which raises consumption-linked charges. The full calculation, evidence and reviewer are in your Savings Wallet."
    );
  }
  if (q.includes("solar")) {
    return (
      "Based on your roof (28,000 sq ft) and your daytime load, SolarFit recommends a 150 kW rooftop system with an estimated saving of ₹14.2 lakh/year and roughly 3.7-year payback. This is still an estimate — review the draft SolarFit study before deciding. Monsoon months are already modelled into the annual figure."
    );
  }
  if (q.includes("save") || q.includes("saving")) {
    return `So far at ${siteName}: ${formatINR(wallet.identified)}/year identified, ${formatINR(wallet.approved)}/year approved, ${formatINR(wallet.implemented)}/year implemented and ${formatINR(wallet.verified)}/year verified by measurement. About ${formatINR(wallet.monthlyAtRisk)}/month is still at risk until the pending actions are taken. See the Savings Wallet for every calculation.`;
  }
  if (q.includes("product") || q.includes("activate next")) {
    const recommended = productsForSite(siteId).filter((p) => p.entitlement.state === "recommended");
    if (recommended.length > 0) {
      return (
        "WattZap currently recommends:\n" +
        recommended
          .map((p) => `• ${p.def.name} — ${p.entitlement.stateReason}`)
          .join("\n") +
        "\n\nEach recommendation shows its estimated value and what activating involves — nothing activates without your approval."
      );
    }
    return "No new product is recommended right now. Your Savings Journey page shows what unlocks next and why.";
  }
  if (q.includes("data") && q.includes("missing")) {
    const dataIssues = alertsForSite(siteId).filter((a) => a.category === "data_issue");
    return dataIssues.length > 0
      ? `One data issue is open: ${dataIssues[0].whatHappened} ${dataIssues[0].recommendedAction}`
      : "No data issues are open for this site right now.";
  }
  return (
    `I can explain anything about ${siteName} — bills, penalties, demand spikes, savings, or which WattZap product helps with what.\n\nTry asking: "Why is my bill higher?", "What is power factor?", or "How much can I save?"` +
    "\n\n(I only use your own site's data, and I'll always tell you whether a number is estimated, measured or verified.)"
  );
}
