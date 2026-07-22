import type { EntitlementRule, ProductDef, JourneyStageId } from "@/lib/types";

export const JOURNEY_STAGES: {
  id: JourneyStageId;
  name: string;
  purpose: string;
}[] = [
  {
    id: "diagnose",
    name: "Diagnose",
    purpose: "Understand where your site loses money on electricity.",
  },
  {
    id: "protect",
    name: "Protect",
    purpose: "Stop penalties, billing errors and avoidable charges.",
  },
  {
    id: "optimise",
    name: "Optimise",
    purpose: "Monitor your site continuously and run it efficiently.",
  },
  {
    id: "generate",
    name: "Generate",
    purpose: "Produce your own lower-cost power with right-sized solar.",
  },
  {
    id: "finance",
    name: "Finance",
    purpose: "Access savings assets without heavy upfront investment.",
  },
  {
    id: "prove",
    name: "Prove",
    purpose: "Measure and verify that every saving actually happened.",
  },
];

export const PRODUCTS: ProductDef[] = [
  {
    slug: "energyscan-lite",
    name: "EnergyScan Lite",
    stage: "diagnose",
    tagline: "A quick first check of your electricity costs.",
    description:
      "A simple initial assessment using your electricity bill and basic site details. It gives you an energy-cost score, likely problem areas and an estimated savings range.",
    whatItDoes: [
      "Reads one electricity bill and basic site details",
      "Gives an initial energy-cost score",
      "Highlights possible problem areas",
      "Estimates a savings range",
      "Recommends your next step",
    ],
    commercialModel: "Free for qualified customers",
    icon: "search",
  },
  {
    slug: "energyscan-pro",
    name: "EnergyScan Pro",
    stage: "diagnose",
    tagline: "A detailed diagnosis of exactly where money is lost.",
    description:
      "A detailed paid energy diagnosis using 12 months of bills, meter data and machinery details. It produces a prioritised list of savings opportunities with estimated value and payback.",
    whatItDoes: [
      "Analyses 12 months of bills and interval meter data",
      "Finds power-factor penalties and demand risks",
      "Detects billing anomalies",
      "Checks solar suitability",
      "Builds your baseline and prioritised savings plan",
    ],
    commercialModel: "One-time assessment fee",
    icon: "scan",
  },
  {
    slug: "pf-guard",
    name: "PF Guard",
    stage: "protect",
    tagline: "Stops power-factor penalties on your bill.",
    description:
      "Watches how efficiently your site uses electricity and protects you from power-factor penalties and poor reactive-power performance.",
    whatItDoes: [
      "Tracks your power factor every billing period",
      "Flags penalty periods and their cost",
      "Identifies likely causes (e.g. idling motors)",
      "Recommends corrective actions",
      "Verifies that penalties actually reduced",
    ],
    commercialModel: "Monthly subscription",
    icon: "shield",
  },
  {
    slug: "demand-guard",
    name: "Demand Guard",
    stage: "protect",
    tagline: "Prevents costly demand spikes.",
    description:
      "Protects you from maximum-demand spikes, demand penalties and paying for more contracted demand than you need.",
    whatItDoes: [
      "Tracks recorded maximum demand vs your sanctioned limit",
      "Builds a timeline of demand spikes",
      "Identifies which machines run together and cause spikes",
      "Recommends schedule changes to avoid spikes",
      "Verifies demand-cost reduction",
    ],
    commercialModel: "Monthly subscription",
    icon: "gauge",
  },
  {
    slug: "bill-guard",
    name: "Bill Guard",
    stage: "protect",
    tagline: "Checks every bill for errors and hidden charges.",
    description:
      "Checks each electricity bill for anomalies, tariff errors, penalties, incorrect demand values and unexplained deviations.",
    whatItDoes: [
      "Validates every bill line-by-line",
      "Compares each bill with your history",
      "Flags penalties and suspected errors",
      "Prepares disputes where money can be recovered",
      "Tracks recovered amounts",
    ],
    commercialModel: "Monthly subscription",
    icon: "receipt",
  },
  {
    slug: "solar-guard",
    name: "Solar Guard",
    stage: "protect",
    tagline: "Makes sure your solar delivers what it promised.",
    description:
      "Monitors whether an existing solar system is delivering expected performance and identifies underperformance and downtime.",
    whatItDoes: [
      "Compares actual vs expected solar generation",
      "Flags underperformance and downtime",
      "Estimates lost generation in rupees",
      "Recommends corrective maintenance",
    ],
    commercialModel: "Monthly subscription",
    icon: "sun",
  },
  {
    slug: "ems-lite",
    name: "EMS Lite",
    stage: "optimise",
    tagline: "Live monitoring of your site, in plain language.",
    description:
      "Continuous monitoring, analytics, alerts and operational guidance for your site — powered by live meter data through WattZap Edge.",
    whatItDoes: [
      "Shows live energy use, demand and power factor",
      "Sends alerts before penalties happen",
      "Tracks data freshness and meter health",
      "Recommends daily operational actions",
    ],
    commercialModel: "Monthly subscription + Edge hardware",
    icon: "activity",
  },
  {
    slug: "wattzap-edge",
    name: "WattZap Edge",
    stage: "optimise",
    tagline: "The small onsite device that connects your site to WattZap.",
    description:
      "An onsite data-acquisition and control device that connects to your existing meters, machines, solar systems and other energy assets.",
    whatItDoes: [
      "Connects to your existing meters and machines",
      "Streams data securely to WattZap",
      "Enables live monitoring and future control",
    ],
    commercialModel: "Hardware + installation",
    icon: "cpu",
  },
  {
    slug: "solarfit",
    name: "SolarFit",
    stage: "generate",
    tagline: "The right-sized solar system for your actual load.",
    description:
      "Recommends the right-sized solar system based on your actual load profile, tariff, roof availability and operational requirements — not a one-size-fits-all quote.",
    whatItDoes: [
      "Sizes solar from your real load profile",
      "Models self-consumption vs export",
      "Compares alternative sizing scenarios",
      "Shows investment, savings and payback clearly",
    ],
    commercialModel: "Included with EnergyScan Pro / standalone study",
    icon: "sunrise",
  },
  {
    slug: "solarlease",
    name: "SolarLease",
    stage: "finance",
    tagline: "Solar savings without heavy upfront investment.",
    description:
      "Allows selected customers to access solar or other savings assets through a structured lease, service or performance-linked model.",
    whatItDoes: [
      "Little or no upfront investment",
      "Fixed monthly payment below your energy saving",
      "WattZap manages installation and performance",
      "Subject to commercial and credit review",
    ],
    commercialModel: "Lease / performance-linked",
    icon: "wallet",
  },
  {
    slug: "savings-assurance",
    name: "Savings Assurance",
    stage: "prove",
    tagline: "Independent proof that your savings are real.",
    description:
      "Continuously measures, validates and reports whether savings were actually achieved. This is the trust layer across everything WattZap does.",
    whatItDoes: [
      "Agrees a baseline with you before changes",
      "Measures savings after implementation",
      "Adjusts fairly for production changes",
      "Publishes verified savings with full evidence",
    ],
    commercialModel: "Included with active WattZap products",
    icon: "badge-check",
  },
];

export function productBySlug(slug: string): ProductDef | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/**
 * Configurable unlocking rules. Stored as data (not hard-coded UI checks) so
 * they can move to the `entitlement_rules` table unchanged.
 */
export const ENTITLEMENT_RULES: EntitlementRule[] = [
  {
    product: "energyscan-lite",
    requiresReadiness: ["no_data"],
    description: "Unlocked for all qualified customers after registration.",
  },
  {
    product: "energyscan-pro",
    requiresReadiness: ["bill_data"],
    description:
      "Requires uploaded bills, complete site information, and purchase or approval of the assessment.",
  },
  {
    product: "pf-guard",
    requiresReadiness: ["bill_data"],
    requiresProducts: ["energyscan-pro"],
    description:
      "Eligible when power-factor data exists and poor power-factor events are identified.",
  },
  {
    product: "demand-guard",
    requiresReadiness: ["bill_data"],
    requiresProducts: ["energyscan-pro"],
    description:
      "Eligible when demand data exists and demand spikes or contracted-demand inefficiency are detected.",
  },
  {
    product: "bill-guard",
    requiresReadiness: ["bill_data"],
    description:
      "Eligible when electricity bills are uploaded and tariff parameters are available.",
  },
  {
    product: "solar-guard",
    requiresReadiness: ["bill_data"],
    requiresFlags: ["has_solar"],
    description:
      "Eligible when existing solar assets are registered and generation data is available.",
  },
  {
    product: "ems-lite",
    requiresReadiness: ["live_meter"],
    requiresProducts: ["wattzap-edge"],
    description:
      "Eligible when WattZap Edge is installed or a compatible meter-data integration exists.",
  },
  {
    product: "wattzap-edge",
    requiresReadiness: ["bill_data"],
    description: "Available once a site survey confirms meter compatibility.",
  },
  {
    product: "solarfit",
    requiresReadiness: ["historical_interval"],
    requiresFlags: ["has_roof_data"],
    description:
      "Eligible when the load profile is sufficiently complete and roof information is available.",
  },
  {
    product: "solarlease",
    requiresReadiness: ["historical_interval"],
    requiresProducts: ["solarfit"],
    requiresFlags: ["commercial_review_passed"],
    description:
      "Eligible only after commercial review, credit eligibility, site assessment, a SolarFit recommendation and internal WattZap approval.",
  },
  {
    product: "savings-assurance",
    requiresReadiness: ["historical_interval"],
    requiresFlags: ["has_baseline", "has_implemented_action"],
    description:
      "Eligible when a baseline exists, an approved savings action is implemented and sufficient measurement data exists.",
  },
];

export const MATURITY_LEVELS: Record<
  number,
  { name: string; description: string; nextStep: string }
> = {
  0: {
    name: "Demo",
    description: "You are exploring WattZap with illustrative data.",
    nextStep: "Add your site and upload a bill to begin your real journey.",
  },
  1: {
    name: "Historical Diagnosis",
    description:
      "Your savings plan is built from bills, meter files and your EnergyScan results.",
    nextStep:
      "Connect live monitoring (EMS Lite) to catch penalties before they happen.",
  },
  2: {
    name: "Connected Monitoring",
    description: "Your site sends live or frequent data to WattZap.",
    nextStep: "Move to managed performance with alerts and guided actions.",
  },
  3: {
    name: "Managed Performance",
    description: "Actions, alerts and active operational support are running.",
    nextStep: "Add measured baselines so every saving can be verified.",
  },
  4: {
    name: "Verified Optimisation",
    description:
      "Savings are measured against baselines and independently verified.",
    nextStep: "Explore automated coordination of equipment, solar and loads.",
  },
  5: {
    name: "Automated Optimisation",
    description:
      "Equipment, solar, batteries and flexible loads are coordinated automatically.",
    nextStep: "You are at the most advanced WattZap level.",
  },
};
