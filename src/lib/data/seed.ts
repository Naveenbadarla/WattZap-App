import type {
  ActionItem,
  Alert,
  DemandEvent,
  DocumentItem,
  Entitlement,
  Equipment,
  MonthlyBill,
  OnboardingMilestone,
  OnboardingStep,
  Opportunity,
  Organisation,
  PFEvent,
  Report,
  SavingsEntry,
  Site,
  SupportRequest,
  TodProfilePoint,
  User,
} from "@/lib/types";

/**
 * Realistic demo dataset for the pilot customer.
 *
 * IMPORTANT: nothing here claims to be live. The rice mill is at maturity
 * level 1 (Historical Diagnosis): bills + meter files + EnergyScan Pro done,
 * EMS Lite in onboarding, Savings Assurance baseline in preparation.
 * Every record carries a DataTag (historical / uploaded / estimated /
 * simulated / verified) that the UI must always display.
 */

export const ORG: Organisation = {
  id: "org-vsai",
  name: "Venkata Sai Agro Industries",
  gstin: "36AABCV1234F1Z5",
  createdAt: "2026-02-10",
};

export const SITES: Site[] = [
  {
    id: "site-ricemill",
    orgId: "org-vsai",
    name: "Venkata Sai Rice Mill",
    shortName: "Rice Mill",
    industry: "Rice mill",
    location: "Nizamabad",
    state: "Telangana",
    connectionType: "HT 11 kV",
    discom: "TGNPDCL",
    sanctionedDemandKva: 500,
    contractDemandKva: 450,
    connectedLoadKw: 780,
    operatingHours: "06:00–22:00, 6 days/week",
    monthlyProductionTonnes: 1450,
    productionUnit: "tonnes of rice",
    solarInstalledKw: 0,
    roofAreaSqft: 28000,
    dataReadiness: "historical_interval",
    maturityLevel: 1,
    health: "needs_attention",
    healthReason: "High demand was detected twice this week.",
    createdAt: "2026-02-10",
  },
  {
    id: "site-coldstore",
    orgId: "org-vsai",
    name: "Venkata Sai Cold Storage",
    shortName: "Cold Storage",
    industry: "Cold storage",
    location: "Karimnagar",
    state: "Telangana",
    connectionType: "HT 11 kV",
    discom: "TGNPDCL",
    sanctionedDemandKva: 150,
    contractDemandKva: 140,
    connectedLoadKw: 210,
    operatingHours: "24 hours, 7 days/week",
    monthlyProductionTonnes: 900,
    productionUnit: "tonnes stored",
    solarInstalledKw: 0,
    roofAreaSqft: 12000,
    dataReadiness: "bill_data",
    maturityLevel: 1,
    health: "good",
    healthReason: "No urgent issues found in the bills reviewed so far.",
    createdAt: "2026-05-04",
  },
];

export const USERS: User[] = [
  {
    id: "user-owner",
    orgId: "org-vsai",
    name: "Ramesh Rao",
    email: "owner@venkatasai.in",
    password: "demo1234",
    role: "owner",
    phone: "+91 98490 11111",
    siteIds: ["site-ricemill", "site-coldstore"],
    allSites: true,
  },
  {
    id: "user-plant",
    orgId: "org-vsai",
    name: "Suresh Kumar",
    email: "plant@venkatasai.in",
    password: "demo1234",
    role: "plant_manager",
    phone: "+91 98490 22222",
    siteIds: ["site-ricemill"],
  },
  {
    id: "user-finance",
    orgId: "org-vsai",
    name: "Lakshmi Devi",
    email: "accounts@venkatasai.in",
    password: "demo1234",
    role: "finance",
    phone: "+91 98490 33333",
    siteIds: ["site-ricemill", "site-coldstore"],
    allSites: true,
  },
  {
    id: "user-maint",
    orgId: "org-vsai",
    name: "Ravi Teja",
    email: "maintenance@venkatasai.in",
    password: "demo1234",
    role: "maintenance",
    phone: "+91 98490 44444",
    siteIds: ["site-ricemill"],
  },
  {
    id: "user-analyst",
    orgId: null,
    name: "Ananya Sharma",
    email: "analyst@wattzap.in",
    password: "demo1234",
    role: "wattzap_internal",
    internalRole: "energy_analyst",
    siteIds: ["site-ricemill", "site-coldstore"],
    allSites: true,
  },
];

// ---------------------------------------------------------------------------
// Product entitlements (backend-stored, per site)
// ---------------------------------------------------------------------------

export const ENTITLEMENTS: Entitlement[] = [
  // ----- Rice Mill -----
  {
    id: "ent-rm-esl",
    siteId: "site-ricemill",
    product: "energyscan-lite",
    state: "completed",
    stateReason: "Completed on 18 Feb 2026. Score: 62/100 — savings potential found.",
    unlockSteps: [],
    recommendedByWattZap: false,
    activatedAt: "2026-02-14",
    updatedAt: "2026-02-18",
  },
  {
    id: "ent-rm-esp",
    siteId: "site-ricemill",
    product: "energyscan-pro",
    state: "completed",
    stateReason:
      "Completed on 28 May 2026. 7 savings opportunities worth an estimated ₹8.4 lakh/year were identified.",
    unlockSteps: [],
    recommendedByWattZap: false,
    activatedAt: "2026-04-02",
    updatedAt: "2026-05-28",
  },
  {
    id: "ent-rm-pf",
    siteId: "site-ricemill",
    product: "pf-guard",
    state: "active",
    stateReason:
      "Active since 5 Jun 2026. The APFC repair has already produced a verified penalty reduction.",
    unlockSteps: [],
    estimatedAnnualValue: 150000,
    recommendedByWattZap: true,
    activatedAt: "2026-06-05",
    updatedAt: "2026-07-15",
  },
  {
    id: "ent-rm-dg",
    siteId: "site-ricemill",
    product: "demand-guard",
    state: "recommended",
    stateReason:
      "Your site experienced 11 demand spikes in the last 90 days. Demand Guard could help avoid an estimated ₹1.2–₹1.8 lakh per year.",
    unlockSteps: [
      "Review the Demand Guard recommendation",
      "Confirm your operating schedule with WattZap",
      "Activate the monthly subscription",
    ],
    estimatedAnnualValue: 150000,
    recommendedByWattZap: true,
    updatedAt: "2026-07-10",
  },
  {
    id: "ent-rm-bg",
    siteId: "site-ricemill",
    product: "bill-guard",
    state: "eligible",
    stateReason:
      "12 months of bills are uploaded. A first check already flagged a suspected ₹60,000 excess demand charge in your March bill.",
    unlockSteps: [
      "Review the March bill finding",
      "Activate Bill Guard to check every future bill automatically",
    ],
    estimatedAnnualValue: 60000,
    recommendedByWattZap: true,
    updatedAt: "2026-07-02",
  },
  {
    id: "ent-rm-sg",
    siteId: "site-ricemill",
    product: "solar-guard",
    state: "locked",
    stateReason:
      "Your site does not have a solar system yet, so there is nothing for Solar Guard to monitor.",
    unlockSteps: [
      "Install solar (see your SolarFit recommendation)",
      "Register the solar asset with WattZap",
      "Solar Guard becomes available automatically",
    ],
    recommendedByWattZap: false,
    updatedAt: "2026-05-28",
  },
  {
    id: "ent-rm-ems",
    siteId: "site-ricemill",
    product: "ems-lite",
    state: "onboarding",
    stateReason:
      "Onboarding in progress — the site survey is scheduled for 29 Jul 2026. Live monitoring is NOT available yet.",
    unlockSteps: [
      "Complete the site survey (scheduled 29 Jul)",
      "Confirm meter compatibility",
      "Install WattZap Edge",
    ],
    estimatedAnnualValue: 100000,
    recommendedByWattZap: true,
    activatedAt: "2026-07-08",
    updatedAt: "2026-07-18",
  },
  {
    id: "ent-rm-edge",
    siteId: "site-ricemill",
    product: "wattzap-edge",
    state: "onboarding",
    stateReason: "Ordered. Will be configured after the meter-compatibility check.",
    unlockSteps: ["Complete site survey", "Confirm meter compatibility"],
    recommendedByWattZap: true,
    activatedAt: "2026-07-08",
    updatedAt: "2026-07-18",
  },
  {
    id: "ent-rm-sf",
    siteId: "site-ricemill",
    product: "solarfit",
    state: "recommended",
    stateReason:
      "Your load profile supports a 150 kW rooftop system. The draft recommendation is ready for your review.",
    unlockSteps: [
      "Review the SolarFit draft recommendation",
      "Confirm roof access for a structural check",
    ],
    estimatedAnnualValue: 1420000,
    recommendedByWattZap: true,
    updatedAt: "2026-06-20",
  },
  {
    id: "ent-rm-slease",
    siteId: "site-ricemill",
    product: "solarlease",
    state: "locked",
    stateReason:
      "SolarLease needs an accepted SolarFit recommendation plus a commercial and credit review by WattZap. It is not automatic.",
    unlockSteps: [
      "Accept or discuss the SolarFit recommendation",
      "Share basic financial documents for the credit review",
      "WattZap completes its internal approval",
    ],
    recommendedByWattZap: false,
    updatedAt: "2026-06-20",
  },
  {
    id: "ent-rm-sa",
    siteId: "site-ricemill",
    product: "savings-assurance",
    state: "onboarding",
    stateReason:
      "Baseline preparation is in progress using your 12 months of bills and meter files. One saving (APFC repair) has already been verified.",
    unlockSteps: [
      "WattZap finalises your energy baseline (target: 15 Aug 2026)",
      "You approve the baseline and measurement method",
    ],
    recommendedByWattZap: true,
    activatedAt: "2026-06-05",
    updatedAt: "2026-07-15",
  },
  // ----- Cold Storage -----
  {
    id: "ent-cs-esl",
    siteId: "site-coldstore",
    product: "energyscan-lite",
    state: "completed",
    stateReason: "Completed on 12 Jun 2026. Score: 71/100 — moderate savings potential.",
    unlockSteps: [],
    recommendedByWattZap: false,
    activatedAt: "2026-06-01",
    updatedAt: "2026-06-12",
  },
  {
    id: "ent-cs-esp",
    siteId: "site-coldstore",
    product: "energyscan-pro",
    state: "recommended",
    stateReason:
      "EnergyScan Lite found possible night-time demand inefficiency. A Pro assessment needs 12 months of bills — 3 of 12 are uploaded.",
    unlockSteps: [
      "Upload the remaining 9 monthly bills",
      "Add your compressor and cold-room details",
      "Approve the Pro assessment",
    ],
    estimatedAnnualValue: 250000,
    recommendedByWattZap: true,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-bg",
    siteId: "site-coldstore",
    product: "bill-guard",
    state: "eligible",
    stateReason: "Bills are being uploaded. Bill Guard can start once tariff details are confirmed.",
    unlockSteps: ["Upload remaining bills", "Confirm tariff category"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-pf",
    siteId: "site-coldstore",
    product: "pf-guard",
    state: "locked",
    stateReason: "Power-factor data will be available after more bills are uploaded or EnergyScan Pro runs.",
    unlockSteps: ["Upload remaining bills", "Complete EnergyScan Pro"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-dg",
    siteId: "site-coldstore",
    product: "demand-guard",
    state: "locked",
    stateReason: "Demand analysis needs 12 months of bills or interval meter data.",
    unlockSteps: ["Upload remaining bills", "Complete EnergyScan Pro"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-sg",
    siteId: "site-coldstore",
    product: "solar-guard",
    state: "locked",
    stateReason: "No solar system is registered at this site.",
    unlockSteps: ["Install solar", "Register the solar asset"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-ems",
    siteId: "site-coldstore",
    product: "ems-lite",
    state: "locked",
    stateReason: "Live monitoring needs WattZap Edge or a compatible meter integration.",
    unlockSteps: ["Complete EnergyScan Pro", "Book a site survey"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-edge",
    siteId: "site-coldstore",
    product: "wattzap-edge",
    state: "locked",
    stateReason: "Available after a site survey confirms meter compatibility.",
    unlockSteps: ["Complete EnergyScan Pro", "Book a site survey"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-sf",
    siteId: "site-coldstore",
    product: "solarfit",
    state: "locked",
    stateReason: "A SolarFit study needs a fuller load profile — complete EnergyScan Pro first.",
    unlockSteps: ["Complete EnergyScan Pro", "Share roof details"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-slease",
    siteId: "site-coldstore",
    product: "solarlease",
    state: "locked",
    stateReason: "SolarLease follows a SolarFit recommendation and commercial review.",
    unlockSteps: ["Complete SolarFit first"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
  {
    id: "ent-cs-sa",
    siteId: "site-coldstore",
    product: "savings-assurance",
    state: "locked",
    stateReason: "Savings verification needs a baseline and an implemented savings action.",
    unlockSteps: ["Complete EnergyScan Pro", "Implement a first savings action"],
    recommendedByWattZap: false,
    updatedAt: "2026-07-01",
  },
];

// ---------------------------------------------------------------------------
// Monthly bills — Rice Mill (Jul 2025 – Jun 2026, uploaded & analysed)
// ---------------------------------------------------------------------------

export const BILLS: MonthlyBill[] = [
  bill("2025-07", 912400, 98400, 428, 450, 0.93, 0, 0, []),
  bill("2025-08", 887300, 95100, 415, 450, 0.94, 0, 0, []),
  bill("2025-09", 924800, 99600, 441, 450, 0.92, 0, 0, []),
  bill("2025-10", 1012600, 108200, 462, 462, 0.91, 0, 21400, [
    "Recorded demand exceeded contracted demand (462 vs 450 kVA).",
  ]),
  bill("2025-11", 968200, 101900, 438, 450, 0.87, 14200, 0, [
    "Power factor fell below 0.90 — penalty applied.",
  ]),
  bill("2025-12", 894100, 94800, 421, 450, 0.92, 0, 0, []),
  bill("2026-01", 858700, 91200, 409, 450, 0.93, 0, 0, []),
  bill("2026-02", 872900, 92600, 418, 450, 0.94, 0, 0, []),
  bill("2026-03", 1094500, 104800, 471, 505, 0.84, 18600, 60200, [
    "Billed demand (505 kVA) does not match recorded demand (471 kVA) — suspected billing error worth ~₹60,000.",
    "Power factor fell to 0.84 — penalty ₹18,600.",
    "Bill is 18% higher than the expected range for this production level.",
  ]),
  bill("2026-04", 948600, 100300, 447, 450, 0.91, 0, 0, []),
  bill("2026-05", 981200, 103500, 456, 456, 0.9, 0, 8400, [
    "Recorded demand exceeded contracted demand (456 vs 450 kVA).",
  ]),
  bill("2026-06", 1004800, 106100, 464, 464, 0.88, 9800, 19600, [
    "Recorded demand exceeded contracted demand (464 vs 450 kVA).",
    "Power factor fell to 0.88 — penalty ₹9,800.",
  ]),
  // Cold storage — only 3 bills uploaded so far
  csBill("2026-04", 289400, 41200, 128, 0.95),
  csBill("2026-05", 301800, 43100, 132, 0.94),
  csBill("2026-06", 312600, 44600, 136, 0.94),
];

function bill(
  month: string,
  amount: number,
  units: number,
  recordedMd: number,
  billedMd: number,
  pf: number,
  pfPenalty: number,
  mdPenalty: number,
  anomalies: string[]
): MonthlyBill {
  return {
    id: `bill-rm-${month}`,
    siteId: "site-ricemill",
    month,
    billNumber: `TGN/${month.replace("-", "")}/48213`,
    amount,
    unitsKwh: units,
    recordedMdKva: recordedMd,
    billedMdKva: billedMd,
    powerFactor: pf,
    pfPenalty,
    mdPenalty,
    todPeakUnits: Math.round(units * 0.24),
    todNormalUnits: Math.round(units * 0.58),
    todOffpeakUnits: Math.round(units * 0.18),
    anomalies,
    status: anomalies.length > 0 ? "flagged" : "analysed",
    dataTag: "uploaded",
  };
}

function csBill(month: string, amount: number, units: number, md: number, pf: number): MonthlyBill {
  return {
    id: `bill-cs-${month}`,
    siteId: "site-coldstore",
    month,
    billNumber: `TGN/${month.replace("-", "")}/77120`,
    amount,
    unitsKwh: units,
    recordedMdKva: md,
    billedMdKva: 140,
    powerFactor: pf,
    pfPenalty: 0,
    mdPenalty: 0,
    todPeakUnits: Math.round(units * 0.3),
    todNormalUnits: Math.round(units * 0.4),
    todOffpeakUnits: Math.round(units * 0.3),
    anomalies: [],
    status: "analysed",
    dataTag: "uploaded",
  };
}

// ---------------------------------------------------------------------------
// Demand spike events — Rice Mill (last 90 days, from uploaded MRI meter data)
// ---------------------------------------------------------------------------

export const DEMAND_EVENTS: DemandEvent[] = [
  de("2026-07-18", "10:42", 468, 450, 22, "Dryer started while both hullers were running", 8500),
  de("2026-07-15", "09:55", 461, 450, 15, "Compressors and elevator started together after a break", 6100),
  de("2026-07-08", "11:20", 458, 450, 12, "Dryer batch change overlapped with polisher load", 4400),
  de("2026-06-27", "10:15", 464, 450, 25, "Dryer started while both hullers were running", 9800),
  de("2026-06-19", "16:40", 455, 450, 10, "Evening shift start-up sequence", 2800),
  de("2026-06-11", "10:05", 460, 450, 18, "Dryer + huller coincidence", 5600),
  de("2026-05-30", "09:48", 456, 450, 14, "Compressor restart after maintenance", 3400),
  de("2026-05-21", "10:30", 462, 450, 20, "Dryer + huller coincidence", 7200),
  de("2026-05-12", "11:05", 453, 450, 8, "Elevator group start", 2100),
  de("2026-05-02", "10:22", 459, 450, 16, "Dryer + huller coincidence", 5100),
  de("2026-04-24", "09:58", 457, 450, 13, "Morning start-up sequence", 3900),
];

function de(
  date: string,
  time: string,
  peak: number,
  threshold: number,
  duration: number,
  cause: string,
  cost: number
): DemandEvent {
  return {
    id: `de-${date}-${time.replace(":", "")}`,
    siteId: "site-ricemill",
    date,
    time,
    peakKva: peak,
    thresholdKva: threshold,
    durationMin: duration,
    likelyCause: cause,
    estimatedCost: cost,
    dataTag: "historical",
  };
}

// ---------------------------------------------------------------------------
// Power-factor events — Rice Mill
// ---------------------------------------------------------------------------

export const PF_EVENTS: PFEvent[] = [
  pf("2025-07", 0.93, 0.9, "18:00–20:00", 0, "—"),
  pf("2025-08", 0.94, 0.91, "18:00–19:00", 0, "—"),
  pf("2025-09", 0.92, 0.89, "17:00–19:00", 0, "Evening light-load running"),
  pf("2025-10", 0.91, 0.88, "18:00–20:00", 0, "Evening light-load running"),
  pf("2025-11", 0.87, 0.82, "17:00–21:00", 14200, "APFC capacitor stage 3 failed"),
  pf("2025-12", 0.92, 0.89, "18:00–19:30", 0, "APFC partially repaired"),
  pf("2026-01", 0.93, 0.9, "18:00–19:00", 0, "—"),
  pf("2026-02", 0.94, 0.91, "18:00–19:00", 0, "—"),
  pf("2026-03", 0.84, 0.78, "17:30–21:30", 18600, "APFC panel tripped for 9 days — not noticed"),
  pf("2026-04", 0.91, 0.88, "18:00–19:30", 0, "APFC repaired 4 Apr"),
  pf("2026-05", 0.9, 0.87, "18:00–20:00", 0, "Stage 3 degrading again"),
  pf("2026-06", 0.88, 0.84, "17:30–20:30", 9800, "APFC stage 3 failed again — replaced 28 Jun"),
];

function pf(
  month: string,
  avg: number,
  worst: number,
  window: string,
  penalty: number,
  cause: string
): PFEvent {
  return {
    id: `pf-${month}`,
    siteId: "site-ricemill",
    month,
    avgPf: avg,
    worstPf: worst,
    worstWindow: window,
    penalty,
    likelyCause: cause,
    dataTag: "historical",
  };
}

// ---------------------------------------------------------------------------
// Typical-day time-of-day profile (from uploaded MRI data — historical)
// ---------------------------------------------------------------------------

export const TOD_PROFILE: TodProfilePoint[] = [
  { hour: "00:00", kva: 82, kwh: 74 },
  { hour: "02:00", kva: 78, kwh: 70 },
  { hour: "04:00", kva: 85, kwh: 77 },
  { hour: "06:00", kva: 210, kwh: 189 },
  { hour: "08:00", kva: 348, kwh: 320 },
  { hour: "10:00", kva: 452, kwh: 415 },
  { hour: "12:00", kva: 410, kwh: 380 },
  { hour: "14:00", kva: 398, kwh: 365 },
  { hour: "16:00", kva: 421, kwh: 388 },
  { hour: "18:00", kva: 375, kwh: 342 },
  { hour: "20:00", kva: 290, kwh: 262 },
  { hour: "22:00", kva: 120, kwh: 106 },
];

// ---------------------------------------------------------------------------
// Opportunities — Rice Mill + Cold Storage
// ---------------------------------------------------------------------------

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-apfc",
    siteId: "site-ricemill",
    title: "Repair the automatic capacitor (APFC) panel",
    plainExplanation:
      "A panel that keeps your electricity use efficient was partly broken. Fixing it stops a recurring penalty on your bill.",
    whatHappened:
      "Capacitor stage 3 in your APFC panel failed twice (Nov 2025 and Jun 2026), causing power-factor penalties of ₹14,200, ₹18,600 and ₹9,800.",
    whyItMatters:
      "Every month the panel is faulty, the electricity board adds a penalty to your bill. This money buys you nothing.",
    technicalDetail:
      "Average PF fell to 0.84–0.88 in affected months (target ≥ 0.95). Stage 3 (25 kVAr) failed; stages 1–2 healthy. Panel replaced on 28 Jun 2026 with a 5-year AMC.",
    annualSaving: 150000,
    implementationCost: 45000,
    paybackMonths: 4,
    confidence: "high",
    complexity: "low",
    priority: 1,
    product: "pf-guard",
    requiredAction: "Completed — panel repaired and verified.",
    decisionOwnerRole: "owner",
    status: "verified",
    evidence: [
      "Bills Nov 2025 / Mar 2026 / Jun 2026 showing PF penalties",
      "APFC service report, 28 Jun 2026",
      "Jul 2026 interim meter data showing PF 0.96",
    ],
    identifiedOn: "2026-05-28",
    dataTag: "verified",
    activity: [
      ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro"),
      ev("2026-06-02", "Ramesh Rao", "Approved", "Please fix this before the next billing cycle."),
      ev("2026-06-28", "Ravi Teja", "Implemented — APFC panel repaired"),
      ev("2026-07-15", "WattZap (Savings Verifier)", "Saving verified at ₹1.25 lakh/year"),
    ],
  },
  {
    id: "opp-dryer",
    siteId: "site-ricemill",
    title: "Shift the dryer start time by 20 minutes",
    plainExplanation:
      "When the dryer starts while both hullers are running, your site briefly draws too much power and risks penalties. Starting it 20 minutes later avoids this.",
    whatHappened:
      "9 of the last 11 demand spikes happened between 09:45 and 11:30, when the paddy dryer started while both hullers were already running.",
    whyItMatters:
      "Each spike pushes your recorded maximum demand above your contracted 450 kVA, which raises demand charges. Avoiding these events could reduce your monthly electricity cost.",
    technicalDetail:
      "Coincident load: dryer (110 kW) + hullers (2×45 kW) + compressors. Peak recorded 468 kVA vs 450 kVA contracted. Staggering the dryer start removes ~35–45 kVA of coincident demand.",
    annualSaving: 55000,
    implementationCost: 0,
    paybackMonths: 0,
    confidence: "high",
    complexity: "low",
    priority: 1,
    product: "demand-guard",
    requiredAction: "Follow the new start-up sequence daily; WattZap is measuring the result.",
    decisionOwnerRole: "plant_manager",
    status: "measuring",
    evidence: ["Demand event log Apr–Jul 2026", "Revised start-up sequence signed by plant manager"],
    identifiedOn: "2026-05-28",
    dataTag: "estimated",
    activity: [
      ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro"),
      ev("2026-06-20", "Suresh Kumar", "Approved and new sequence adopted"),
      ev("2026-07-01", "WattZap (Savings Verifier)", "Measurement period started (Jul–Sep 2026)"),
    ],
  },
  {
    id: "opp-cd",
    siteId: "site-ricemill",
    title: "Reduce contracted demand from 450 to 420 kVA",
    plainExplanation:
      "You pay a fixed monthly charge for 450 kVA of guaranteed capacity, but after fixing the demand spikes you will rarely need more than 420 kVA.",
    whatHappened:
      "Analysis of 12 months of demand data shows that outside spike events, your demand stays below 420 kVA in 11 of 12 months.",
    whyItMatters:
      "Lowering the contracted demand cuts the fixed portion of your bill every single month — with no operational change.",
    technicalDetail:
      "Demand charges at ~₹390/kVA/month × 30 kVA ≈ ₹11,700/month. Requires DISCOM application; should follow 3 clean months after the dryer-sequence change to avoid exceeding the lower limit.",
    annualSaving: 130000,
    implementationCost: 0,
    paybackMonths: 0,
    confidence: "medium",
    complexity: "medium",
    priority: 2,
    product: "demand-guard",
    requiredAction: "Approve, then WattZap prepares the DISCOM application for October 2026.",
    decisionOwnerRole: "owner",
    status: "approved",
    evidence: ["12-month demand analysis (EnergyScan Pro §4)", "Demand duration curve"],
    identifiedOn: "2026-05-28",
    dataTag: "estimated",
    activity: [
      ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro"),
      ev("2026-07-05", "Ramesh Rao", "Approved", "Proceed after the dryer change proves itself."),
    ],
  },
  {
    id: "opp-billmar",
    siteId: "site-ricemill",
    title: "Recover the suspected ₹60,000 March billing error",
    plainExplanation:
      "Your March bill charged you for more demand (505 kVA) than your meter actually recorded (471 kVA). This looks like a billing error worth about ₹60,000.",
    whatHappened:
      "The March 2026 bill shows billed maximum demand of 505 kVA while the meter MRI data shows 471 kVA.",
    whyItMatters: "If confirmed, this money can be recovered or adjusted against future bills.",
    technicalDetail:
      "Billed MD 505 kVA vs recorded MD 471 kVA. Excess demand charged at penal rate. A formal review request to TGNPDCL with the MRI extract is required.",
    annualSaving: 60000,
    implementationCost: 0,
    paybackMonths: 0,
    confidence: "medium",
    complexity: "medium",
    priority: 1,
    product: "bill-guard",
    requiredAction: "Authorise WattZap to file the review request with your DISCOM.",
    decisionOwnerRole: "finance",
    status: "recommended",
    evidence: ["March 2026 bill (uploaded)", "MRI meter extract for March 2026"],
    identifiedOn: "2026-06-14",
    dataTag: "estimated",
    activity: [
      ev("2026-06-14", "WattZap (Bill Guard preview)", "Anomaly detected during bill validation"),
    ],
  },
  {
    id: "opp-tod",
    siteId: "site-ricemill",
    title: "Move one dryer batch to off-peak hours",
    plainExplanation:
      "Electricity is cheaper at night. Moving one drying batch after 22:00 uses the same power at a lower rate.",
    whatHappened:
      "24% of your energy is used in peak-rate hours (18:00–22:00), but drying is flexible and could run off-peak.",
    whyItMatters: "Same production, same machines — lower rate per unit. Roughly ₹10,000/month.",
    technicalDetail:
      "Shifting ~7,000 kWh/month from peak (+₹1.00/kWh surcharge) to off-peak (−₹0.50/kWh rebate) saves ≈ ₹1.2 lakh/year. Needs one operator on late shift 3 days/week.",
    annualSaving: 120000,
    implementationCost: 0,
    paybackMonths: 0,
    confidence: "medium",
    complexity: "medium",
    priority: 2,
    product: "demand-guard",
    requiredAction: "Review with your plant manager whether a late-shift batch is practical.",
    decisionOwnerRole: "plant_manager",
    status: "recommended",
    evidence: ["Time-of-day analysis (EnergyScan Pro §5)"],
    identifiedOn: "2026-05-28",
    dataTag: "estimated",
    activity: [ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro")],
  },
  {
    id: "opp-idle",
    siteId: "site-ricemill",
    title: "Stop idle running of compressors and elevators during breaks",
    plainExplanation:
      "Machines keep running during lunch and shift changes even when nothing is being processed. Switching them off saves money every day.",
    whatHappened:
      "Meter data shows a steady 55–70 kW draw during the 13:00–14:00 break and at shift changes, when production is stopped.",
    whyItMatters: "That is roughly ₹17,500 of electricity per month doing no useful work.",
    technicalDetail:
      "~2,500 kWh/month idle consumption identified from interval data. Interlocks or a simple switch-off checklist eliminates most of it.",
    annualSaving: 210000,
    implementationCost: 15000,
    paybackMonths: 1,
    confidence: "high",
    complexity: "low",
    priority: 1,
    product: "ems-lite",
    requiredAction: "Approve the switch-off checklist and assign it to the maintenance team.",
    decisionOwnerRole: "plant_manager",
    status: "new",
    evidence: ["Interval-data idle-load analysis (EnergyScan Pro §6)"],
    identifiedOn: "2026-05-28",
    dataTag: "estimated",
    activity: [ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro")],
  },
  {
    id: "opp-huller",
    siteId: "site-ricemill",
    title: "Replace the ageing huller motor No. 2",
    plainExplanation:
      "One of your main milling motors is old and uses more electricity than a modern one for the same work.",
    whatHappened:
      "Huller motor No. 2 (rewound twice) draws ~8% more current than its twin for the same throughput.",
    whyItMatters: "An efficient IE3 motor pays for itself in about 16 months, then keeps saving.",
    technicalDetail:
      "45 kW motor, estimated efficiency loss ~6–8% after two rewinds. IE3 replacement ≈ ₹1.9 lakh installed.",
    annualSaving: 140000,
    implementationCost: 190000,
    paybackMonths: 16,
    confidence: "medium",
    complexity: "medium",
    priority: 3,
    product: "energyscan-pro",
    requiredAction: "Decide whether to replace this season or next.",
    decisionOwnerRole: "owner",
    status: "new",
    evidence: ["Motor current comparison (EnergyScan Pro §7)", "Rewind history"],
    identifiedOn: "2026-05-28",
    dataTag: "estimated",
    activity: [ev("2026-05-28", "WattZap (Ananya Sharma)", "Opportunity identified in EnergyScan Pro")],
  },
  {
    id: "opp-solar",
    siteId: "site-ricemill",
    title: "Install a 150 kW rooftop solar system",
    plainExplanation:
      "Your roof and daytime power use suit a 150 kW solar system. It would supply about a fifth of your electricity at a much lower cost per unit.",
    whatHappened:
      "SolarFit sized 150 kW against your daytime load so almost all solar power is used on-site (94% self-consumption).",
    whyItMatters:
      "Estimated ₹14.2 lakh/year saving at today's tariff. This is a large decision — review the full SolarFit study before counting it in your savings plan.",
    technicalDetail:
      "150 kWp, est. 2.19 lakh kWh/year, 94% self-consumption, capex ≈ ₹52 lakh (or SolarLease subject to approval), simple payback ≈ 3.7 years.",
    annualSaving: 1420000,
    implementationCost: 5200000,
    paybackMonths: 44,
    confidence: "medium",
    complexity: "high",
    priority: 2,
    product: "solarfit",
    requiredAction: "Review the SolarFit draft recommendation with WattZap's solar engineer.",
    decisionOwnerRole: "owner",
    status: "under_review",
    evidence: ["SolarFit draft study v0.9", "Roof survey photos", "12-month load profile"],
    identifiedOn: "2026-06-20",
    dataTag: "estimated",
    activity: [
      ev("2026-06-20", "WattZap (Solar Engineer)", "SolarFit draft recommendation prepared"),
      ev("2026-07-02", "Ramesh Rao", "Question asked", "What happens in the monsoon months?"),
      ev("2026-07-03", "WattZap (Solar Engineer)", "Replied", "Monsoon output is modelled at 55–65% of peak months; the annual figure already includes this."),
    ],
  },
  // Cold storage
  {
    id: "opp-cs-night",
    siteId: "site-coldstore",
    title: "Check night-time demand pattern at the cold storage",
    plainExplanation:
      "Your cold storage seems to use more power at night than similar facilities. A detailed assessment will confirm if money is being lost.",
    whatHappened:
      "EnergyScan Lite flagged night consumption ~15% above the typical band for this storage size.",
    whyItMatters: "If confirmed, defrost-cycle and compressor-staging changes could save ~₹2.5 lakh/year.",
    technicalDetail:
      "Needs 12 months of bills + compressor details for EnergyScan Pro to quantify properly. Current estimate is indicative only.",
    annualSaving: 250000,
    implementationCost: 45000,
    paybackMonths: 3,
    confidence: "low",
    complexity: "medium",
    priority: 2,
    product: "energyscan-pro",
    requiredAction: "Upload the remaining 9 bills to start EnergyScan Pro.",
    decisionOwnerRole: "owner",
    status: "info_required",
    evidence: ["EnergyScan Lite report, 12 Jun 2026"],
    identifiedOn: "2026-06-12",
    dataTag: "estimated",
    activity: [ev("2026-06-12", "WattZap (EnergyScan Lite)", "Indicative finding from initial assessment")],
  },
];

function ev(date: string, actor: string, event: string, comment?: string) {
  return { id: `ev-${date}-${actor.length}-${event.length}`, date, actor, event, comment };
}

// ---------------------------------------------------------------------------
// Savings ledger
// ---------------------------------------------------------------------------

export const SAVINGS: SavingsEntry[] = [
  {
    id: "sav-apfc",
    siteId: "site-ricemill",
    opportunityId: "opp-apfc",
    title: "Power-factor penalty eliminated (APFC repair)",
    product: "pf-guard",
    stage: "verified",
    expectedAnnual: 150000,
    verifiedAnnual: 125000,
    monthlyExpected: 12500,
    monthlyVerified: 10400,
    baseline: "Avg PF 0.89 and ₹3,550/month average penalty over Jul 2025–Jun 2026",
    measurementPeriod: "1–15 Jul 2026 (interim), full verification after Jul bill",
    method: "Bill-to-bill penalty comparison, adjusted for production volume",
    adjustments: "Production was 9% higher than the baseline period",
    varianceReason:
      "Expected ₹12,500/month; verified ₹10,400/month. Production was 9% higher than the baseline period, which raises consumption-linked charges.",
    confidence: "high",
    evidence: ["Jun & Jul bills", "APFC service report", "MRI PF trace"],
    wattzapReviewer: "K. Srinivas (Savings Verifier)",
    customerApprover: "Ramesh Rao",
    status: "Verified on 15 Jul 2026",
    dataTag: "verified",
    updatedAt: "2026-07-15",
  },
  {
    id: "sav-dryer",
    siteId: "site-ricemill",
    opportunityId: "opp-dryer",
    title: "Demand-spike reduction (dryer start-time change)",
    product: "demand-guard",
    stage: "implemented",
    expectedAnnual: 55000,
    monthlyExpected: 4600,
    baseline: "11 spikes / 90 days, avg exceedance 12 kVA (Apr–Jun 2026)",
    measurementPeriod: "Jul–Sep 2026 (in progress)",
    method: "Spike-count and billed-MD comparison vs baseline quarter",
    confidence: "high",
    evidence: ["Demand event log", "Signed start-up sequence"],
    wattzapReviewer: "K. Srinivas (Savings Verifier)",
    status: "Implemented — measurement in progress",
    dataTag: "estimated",
    updatedAt: "2026-07-01",
  },
  {
    id: "sav-cd",
    siteId: "site-ricemill",
    opportunityId: "opp-cd",
    title: "Contracted-demand reduction (450 → 420 kVA)",
    product: "demand-guard",
    stage: "approved",
    expectedAnnual: 130000,
    monthlyExpected: 10800,
    baseline: "Fixed demand charges at 450 kVA contracted",
    method: "Direct tariff calculation — ₹390/kVA/month × 30 kVA less a safety margin",
    confidence: "medium",
    evidence: ["12-month demand duration curve"],
    wattzapReviewer: "Ananya Sharma (Energy Analyst)",
    customerApprover: "Ramesh Rao",
    status: "Approved — DISCOM application planned for Oct 2026",
    dataTag: "estimated",
    updatedAt: "2026-07-05",
  },
  {
    id: "sav-billmar",
    siteId: "site-ricemill",
    opportunityId: "opp-billmar",
    title: "March billing-error recovery",
    product: "bill-guard",
    stage: "identified",
    expectedAnnual: 60000,
    monthlyExpected: 5000,
    baseline: "March 2026 bill as issued",
    method: "Billed vs meter-recorded maximum demand comparison",
    confidence: "medium",
    evidence: ["March 2026 bill", "MRI extract"],
    status: "Awaiting your authorisation to file the DISCOM review",
    dataTag: "estimated",
    updatedAt: "2026-06-14",
  },
  {
    id: "sav-tod",
    siteId: "site-ricemill",
    opportunityId: "opp-tod",
    title: "Off-peak shift of one dryer batch",
    product: "demand-guard",
    stage: "identified",
    expectedAnnual: 120000,
    monthlyExpected: 10000,
    baseline: "Current TOD split: 24% peak / 58% normal / 18% off-peak",
    method: "TOD tariff differential applied to shiftable drying load",
    confidence: "medium",
    evidence: ["TOD analysis (EnergyScan Pro §5)"],
    status: "Awaiting operational review",
    dataTag: "estimated",
    updatedAt: "2026-05-28",
  },
  {
    id: "sav-idle",
    siteId: "site-ricemill",
    opportunityId: "opp-idle",
    title: "Idle-running elimination during breaks",
    product: "ems-lite",
    stage: "identified",
    expectedAnnual: 210000,
    monthlyExpected: 17500,
    baseline: "55–70 kW idle draw during breaks (interval data, Apr–May 2026)",
    method: "Idle-interval energy × tariff, verified later via EMS Lite live data",
    confidence: "high",
    evidence: ["Interval-data idle-load analysis"],
    status: "Awaiting approval of switch-off checklist",
    dataTag: "estimated",
    updatedAt: "2026-05-28",
  },
  {
    id: "sav-huller",
    siteId: "site-ricemill",
    opportunityId: "opp-huller",
    title: "Huller motor No. 2 replacement",
    product: "energyscan-pro",
    stage: "identified",
    expectedAnnual: 140000,
    monthlyExpected: 11700,
    baseline: "Motor current comparison vs identical huller No. 1",
    method: "Efficiency differential × running hours × tariff",
    confidence: "medium",
    evidence: ["Motor current logs", "Rewind history"],
    status: "Decision pending",
    dataTag: "estimated",
    updatedAt: "2026-05-28",
  },
];

// ---------------------------------------------------------------------------
// Actions (operational to-dos)
// ---------------------------------------------------------------------------

export const ACTIONS: ActionItem[] = [
  {
    id: "act-dryer",
    siteId: "site-ricemill",
    opportunityId: "opp-dryer",
    title: "Shift the dryer start time by 20 minutes",
    detail:
      "Start the paddy dryer at 10:05 instead of 09:45, after huller No. 2 reaches steady load. This avoids the morning demand spike.",
    monthlyValue: 4600,
    difficulty: "low",
    assigneeRole: "plant_manager",
    assigneeName: "Suresh Kumar",
    dueDate: "2026-07-25",
    status: "open",
  },
  {
    id: "act-billmar",
    siteId: "site-ricemill",
    opportunityId: "opp-billmar",
    title: "Authorise the March bill review request",
    detail:
      "Sign the authorisation so WattZap can file the ₹60,000 excess-demand review with TGNPDCL on your behalf.",
    monthlyValue: 5000,
    difficulty: "low",
    assigneeRole: "finance",
    assigneeName: "Lakshmi Devi",
    dueDate: "2026-07-31",
    status: "open",
  },
  {
    id: "act-apfc-check",
    siteId: "site-ricemill",
    opportunityId: "opp-apfc",
    title: "Weekly APFC panel indicator check",
    detail: "Check the APFC panel fault indicators every Monday and report any red lamp to WattZap.",
    monthlyValue: 12500,
    difficulty: "low",
    assigneeRole: "maintenance",
    assigneeName: "Ravi Teja",
    dueDate: "2026-07-27",
    status: "open",
  },
  {
    id: "act-survey",
    siteId: "site-ricemill",
    title: "Host the EMS Lite site survey",
    detail: "WattZap's field technician visits on 29 Jul, 10:00–13:00, to check meter compatibility for WattZap Edge.",
    monthlyValue: 8300,
    difficulty: "low",
    assigneeRole: "maintenance",
    assigneeName: "Ravi Teja",
    dueDate: "2026-07-29",
    status: "open",
  },
  {
    id: "act-cs-bills",
    siteId: "site-coldstore",
    title: "Upload the remaining 9 monthly bills",
    detail: "EnergyScan Pro for the cold storage needs 12 months of bills. 3 of 12 are uploaded.",
    monthlyValue: 20800,
    difficulty: "low",
    assigneeRole: "finance",
    assigneeName: "Lakshmi Devi",
    dueDate: "2026-08-05",
    status: "open",
  },
];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

export const ALERTS: Alert[] = [
  {
    id: "al-md-jul18",
    siteId: "site-ricemill",
    category: "action_required",
    title: "Demand crossed 92% of your sanctioned limit",
    whatHappened:
      "On 18 Jul at 10:42, demand reached 468 kVA — above your contracted 450 kVA and 94% of your sanctioned 500 kVA.",
    whenHappened: "2026-07-18 10:42",
    financialImpact: 8500,
    whyItMatters:
      "Crossing your contracted demand raises the demand charge for the whole month. Repeated events can also trigger penal billing.",
    recommendedAction: "Follow the new dryer start-up sequence (start at 10:05, not 09:45).",
    deadline: "2026-07-25",
    responsibleRole: "plant_manager",
    product: "demand-guard",
    evidence: "MRI meter extract, 18 Jul 2026 (historical data)",
    read: false,
    dataTag: "historical",
  },
  {
    id: "al-pf-jun",
    siteId: "site-ricemill",
    category: "action_required",
    title: "Power factor fell below the target range in June",
    whatHappened:
      "Your site used electricity inefficiently during evening hours in June (worst PF 0.84, 17:30–20:30). This caused approximately ₹9,800 in avoidable charges.",
    whenHappened: "2026-06-30",
    financialImpact: 9800,
    whyItMatters:
      "The APFC stage that failed has been replaced, but weekly checks are needed to catch a repeat early.",
    recommendedAction: "Keep the weekly APFC indicator check until PF Guard confirms stability.",
    deadline: "2026-07-27",
    responsibleRole: "maintenance",
    product: "pf-guard",
    evidence: "June 2026 bill + MRI PF trace (historical data)",
    read: false,
    dataTag: "historical",
  },
  {
    id: "al-bill-mar",
    siteId: "site-ricemill",
    category: "action_required",
    title: "March electricity bill is 18% higher than expected",
    whatHappened:
      "The March 2026 bill (₹10.9 lakh) is 18% above the expected range. ₹60,200 appears to be an excess demand charge based on a demand value your meter never recorded.",
    whenHappened: "2026-06-14",
    financialImpact: 60200,
    whyItMatters: "If confirmed as a billing error, this amount can be recovered.",
    recommendedAction: "Authorise WattZap to file the review request with TGNPDCL.",
    deadline: "2026-07-31",
    responsibleRole: "finance",
    product: "bill-guard",
    evidence: "March 2026 bill vs MRI extract (uploaded data)",
    read: false,
    dataTag: "uploaded",
  },
  {
    id: "al-dg-reco",
    siteId: "site-ricemill",
    category: "product_recommendation",
    title: "Demand Guard is recommended for your site",
    whatHappened:
      "11 demand spikes were detected in the last 90 days from your uploaded meter data.",
    whenHappened: "2026-07-10",
    financialImpact: 150000,
    whyItMatters:
      "Demand Guard tracks these events continuously and warns you before they cost money. Estimated value: ₹1.2–₹1.8 lakh/year.",
    recommendedAction: "Review the Demand Guard recommendation.",
    responsibleRole: "owner",
    product: "demand-guard",
    evidence: "Demand event log, Apr–Jul 2026 (historical data)",
    read: false,
    dataTag: "estimated",
  },
  {
    id: "al-data-meter",
    siteId: "site-ricemill",
    category: "data_issue",
    title: "May meter file has a 6-day gap",
    whatHappened: "The uploaded May MRI file is missing 12–17 May. Demand analysis for May is less precise.",
    whenHappened: "2026-07-02",
    financialImpact: null,
    whyItMatters: "Gaps reduce the confidence of savings measurements during that period.",
    recommendedAction: "Ask your meter-reading agency for the full May extract and re-upload it.",
    responsibleRole: "maintenance",
    product: "energyscan-pro",
    evidence: "Data-quality check, upload #14",
    read: true,
    dataTag: "uploaded",
  },
  {
    id: "al-verified",
    siteId: "site-ricemill",
    category: "information",
    title: "Your first saving has been verified: ₹1.25 lakh/year",
    whatHappened:
      "The APFC repair saving was measured and verified by WattZap's savings verifier on 15 Jul 2026.",
    whenHappened: "2026-07-15",
    financialImpact: 125000,
    whyItMatters: "This is measured money, not an estimate. See the full calculation in your Savings Wallet.",
    recommendedAction: "View the verification details in the Savings Wallet.",
    responsibleRole: "owner",
    product: "savings-assurance",
    evidence: "Savings verification record SA-2026-004",
    read: true,
    dataTag: "verified",
  },
  {
    id: "al-cs-esl",
    siteId: "site-coldstore",
    category: "opportunity",
    title: "Possible night-time savings at the cold storage",
    whatHappened:
      "EnergyScan Lite flagged night consumption about 15% above the typical band for a facility of this size.",
    whenHappened: "2026-06-12",
    financialImpact: 250000,
    whyItMatters: "If confirmed by a detailed assessment, changes could save ~₹2.5 lakh/year.",
    recommendedAction: "Upload the remaining 9 bills to start EnergyScan Pro.",
    responsibleRole: "owner",
    product: "energyscan-pro",
    evidence: "EnergyScan Lite report, 12 Jun 2026 (estimated)",
    read: false,
    dataTag: "estimated",
  },
];

// ---------------------------------------------------------------------------
// Reports & documents
// ---------------------------------------------------------------------------

export const REPORTS: Report[] = [
  {
    id: "rep-esp",
    siteId: "site-ricemill",
    type: "EnergyScan Pro",
    title: "EnergyScan Pro — Detailed Energy Diagnosis",
    period: "Jul 2025 – Apr 2026",
    generatedOn: "2026-05-28",
    version: "v1.0",
    status: "final",
    approvedBy: "Ramesh Rao",
    reviewer: "Ananya Sharma (Energy Analyst)",
    summary:
      "7 savings opportunities worth an estimated ₹8.4 lakh/year. Priority: APFC repair, demand-spike control, billing-error recovery.",
    dataTag: "historical",
  },
  {
    id: "rep-esl-rm",
    siteId: "site-ricemill",
    type: "EnergyScan Lite",
    title: "EnergyScan Lite — Initial Assessment",
    period: "Feb 2026",
    generatedOn: "2026-02-18",
    version: "v1.0",
    status: "final",
    reviewer: "WattZap Analysis Desk",
    summary: "Energy-cost score 62/100. Likely issues: PF penalties, demand spikes, TOD inefficiency.",
    dataTag: "estimated",
  },
  {
    id: "rep-monthly-jun",
    siteId: "site-ricemill",
    type: "Monthly Performance",
    title: "Monthly Energy Performance — June 2026",
    period: "Jun 2026",
    generatedOn: "2026-07-08",
    version: "v1.0",
    status: "final",
    reviewer: "Ananya Sharma (Energy Analyst)",
    summary:
      "Consumption 106,100 kWh (+2.5% vs May). One PF penalty (₹9,800, now fixed) and one demand exceedance (₹19,600).",
    dataTag: "historical",
  },
  {
    id: "rep-pfq2",
    siteId: "site-ricemill",
    type: "PF Guard",
    title: "PF Guard — Quarterly Review Q2 2026",
    period: "Apr–Jun 2026",
    generatedOn: "2026-07-12",
    version: "v1.0",
    status: "final",
    reviewer: "K. Srinivas (Savings Verifier)",
    summary: "APFC failure caught and fixed. Verified penalty elimination from July onward.",
    dataTag: "verified",
  },
  {
    id: "rep-bgmar",
    siteId: "site-ricemill",
    type: "Bill Guard",
    title: "Bill Validation — March 2026 Anomaly",
    period: "Mar 2026",
    generatedOn: "2026-06-16",
    version: "v0.9",
    status: "in_review",
    reviewer: "Finance Review Desk",
    summary: "Suspected ₹60,200 excess demand charge. Awaiting customer authorisation to file DISCOM review.",
    dataTag: "uploaded",
  },
  {
    id: "rep-solarfit",
    siteId: "site-ricemill",
    type: "SolarFit",
    title: "SolarFit Recommendation — 150 kW Rooftop",
    period: "Jun 2026",
    generatedOn: "2026-06-20",
    version: "v0.9 (draft)",
    status: "in_review",
    reviewer: "P. Mehta (Solar Engineer)",
    summary:
      "150 kW recommended; 94% self-consumption; est. ₹14.2 lakh/year saving; payback ≈ 3.7 years. Awaiting customer review.",
    dataTag: "estimated",
  },
  {
    id: "rep-esl-cs",
    siteId: "site-coldstore",
    type: "EnergyScan Lite",
    title: "EnergyScan Lite — Cold Storage Initial Assessment",
    period: "Jun 2026",
    generatedOn: "2026-06-12",
    version: "v1.0",
    status: "final",
    reviewer: "WattZap Analysis Desk",
    summary: "Score 71/100. Night-time demand ~15% above typical band — Pro assessment recommended.",
    dataTag: "estimated",
  },
];

let docSeq = 0;
export const DOCUMENTS: DocumentItem[] = [
  doc("site-ricemill", "electricity_bill", "TGNPDCL Bill — June 2026.pdf", "Lakshmi Devi", "2026-07-04", 412, "pdf"),
  doc("site-ricemill", "electricity_bill", "TGNPDCL Bill — May 2026.pdf", "Lakshmi Devi", "2026-06-05", 405, "pdf"),
  doc("site-ricemill", "electricity_bill", "TGNPDCL Bill — March 2026.pdf", "Lakshmi Devi", "2026-04-06", 398, "pdf"),
  doc("site-ricemill", "meter_file", "MRI Extract Apr–Jun 2026.xlsx", "Ravi Teja", "2026-07-02", 1840, "xlsx"),
  doc("site-ricemill", "meter_file", "MRI Extract Jan–Mar 2026.xlsx", "Ravi Teja", "2026-04-10", 1795, "xlsx"),
  doc("site-ricemill", "site_photo", "Roof — north block.jpg", "Suresh Kumar", "2026-06-15", 2200, "image"),
  doc("site-ricemill", "equipment", "APFC Panel Service Report — 28 Jun 2026.pdf", "Ravi Teja", "2026-06-29", 310, "pdf"),
  doc("site-ricemill", "solar", "SolarFit Draft Study v0.9.pdf", "WattZap", "2026-06-20", 2890, "pdf"),
  doc("site-ricemill", "verification_evidence", "Savings Verification SA-2026-004.pdf", "WattZap", "2026-07-15", 540, "pdf"),
  doc("site-ricemill", "quotation", "EMS Lite + Edge Proposal.pdf", "WattZap", "2026-07-05", 680, "pdf"),
  doc("site-coldstore", "electricity_bill", "TGNPDCL Bill — June 2026 (CS).pdf", "Lakshmi Devi", "2026-07-06", 356, "pdf"),
  doc("site-coldstore", "electricity_bill", "TGNPDCL Bill — May 2026 (CS).pdf", "Lakshmi Devi", "2026-06-08", 349, "pdf"),
];

function doc(
  siteId: string,
  category: DocumentItem["category"],
  name: string,
  uploadedBy: string,
  uploadedOn: string,
  sizeKb: number,
  fileType: DocumentItem["fileType"]
): DocumentItem {
  docSeq += 1;
  return { id: `doc-${docSeq}`, siteId, category, name, uploadedBy, uploadedOn, sizeKb, fileType };
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

let obSeq = 0;
export const ONBOARDING: OnboardingStep[] = [
  ob("site-ricemill", 1, "Tell us about your business", "Industry, contacts and basic details.", "done"),
  ob("site-ricemill", 2, "Add your site", "Connection type, sanctioned demand, operating hours.", "done"),
  ob("site-ricemill", 3, "Upload an electricity bill", "One recent bill starts your first analysis.", "done",
    "Your bill was successfully analysed. We found ₹18,600 in penalties that required further review."),
  ob("site-ricemill", 4, "Add basic equipment", "Your main machines help us explain demand patterns.", "done"),
  ob("site-ricemill", 5, "Add solar information", "Roof details recorded — no existing solar.", "done"),
  ob("site-ricemill", 6, "Review initial findings", "EnergyScan Lite results reviewed on 18 Feb.", "done"),
  ob("site-ricemill", 7, "Book or activate EnergyScan", "EnergyScan Pro purchased and completed.", "done"),
  ob("site-ricemill", 8, "Invite colleagues", "4 team members invited.", "done"),
  ob("site-coldstore", 1, "Tell us about your business", "Industry, contacts and basic details.", "done"),
  ob("site-coldstore", 2, "Add your site", "Connection type, sanctioned demand, operating hours.", "done"),
  ob("site-coldstore", 3, "Upload an electricity bill", "3 of 12 bills uploaded — 9 more needed for EnergyScan Pro.", "in_progress",
    "First 3 bills analysed. No penalties found so far — night-time usage looks higher than typical."),
  ob("site-coldstore", 4, "Add basic equipment", "Compressor and cold-room details pending.", "pending"),
  ob("site-coldstore", 5, "Add solar information", "Roof details pending.", "pending"),
  ob("site-coldstore", 6, "Review initial findings", "EnergyScan Lite reviewed on 12 Jun.", "done"),
  ob("site-coldstore", 7, "Book or activate EnergyScan", "EnergyScan Pro recommended — awaiting bills.", "pending"),
  ob("site-coldstore", 8, "Invite colleagues", "Invite your storage supervisor.", "pending"),
];

function ob(
  siteId: string,
  step: number,
  title: string,
  description: string,
  status: OnboardingStep["status"],
  valueMessage?: string
): OnboardingStep {
  obSeq += 1;
  return { id: `ob-${obSeq}`, siteId, step, title, description, status, valueMessage };
}

let msSeq = 0;
export const MILESTONES: OnboardingMilestone[] = [
  ms("site-ricemill", "ems-lite", 1, "Proposal accepted", "done", "2026-07-08"),
  ms("site-ricemill", "ems-lite", 2, "Site survey scheduled", "done", "2026-07-18", "Visit on 29 Jul, 10:00–13:00"),
  ms("site-ricemill", "ems-lite", 3, "Meter compatibility check", "in_progress"),
  ms("site-ricemill", "ems-lite", 4, "WattZap Edge configured", "pending"),
  ms("site-ricemill", "ems-lite", 5, "Installation completed", "pending"),
  ms("site-ricemill", "ems-lite", 6, "Data validation in progress", "pending"),
  ms("site-ricemill", "ems-lite", 7, "Monitoring active", "pending"),
  ms("site-ricemill", "savings-assurance", 1, "12-month data assembled", "done", "2026-06-20"),
  ms("site-ricemill", "savings-assurance", 2, "Baseline model drafted", "in_progress", undefined, "Target: 15 Aug 2026"),
  ms("site-ricemill", "savings-assurance", 3, "Customer approves baseline", "pending"),
  ms("site-ricemill", "savings-assurance", 4, "Measurement & verification live", "pending"),
];

function ms(
  siteId: string,
  product: OnboardingMilestone["product"],
  step: number,
  title: string,
  status: OnboardingMilestone["status"],
  date?: string,
  note?: string
): OnboardingMilestone {
  msSeq += 1;
  return { id: `ms-${msSeq}`, siteId, product, step, title, status, date, note };
}

// ---------------------------------------------------------------------------
// Equipment & support
// ---------------------------------------------------------------------------

export const EQUIPMENT: Equipment[] = [
  { id: "eq-1", siteId: "site-ricemill", name: "Paddy dryer", category: "Process", ratedKw: 110 },
  { id: "eq-2", siteId: "site-ricemill", name: "Huller motor No. 1", category: "Milling", ratedKw: 45 },
  { id: "eq-3", siteId: "site-ricemill", name: "Huller motor No. 2", category: "Milling", ratedKw: 45, notes: "Rewound twice — replacement recommended" },
  { id: "eq-4", siteId: "site-ricemill", name: "Rice polisher line", category: "Milling", ratedKw: 75 },
  { id: "eq-5", siteId: "site-ricemill", name: "Air compressors (2)", category: "Utilities", ratedKw: 74 },
  { id: "eq-6", siteId: "site-ricemill", name: "Bucket elevators & conveyors", category: "Material handling", ratedKw: 38 },
  { id: "eq-7", siteId: "site-ricemill", name: "Colour sorter", category: "Milling", ratedKw: 18 },
  { id: "eq-8", siteId: "site-coldstore", name: "Ammonia compressors (3)", category: "Refrigeration", ratedKw: 132 },
  { id: "eq-9", siteId: "site-coldstore", name: "Evaporator fans", category: "Refrigeration", ratedKw: 28 },
];

export const SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "sr-1",
    siteId: "site-ricemill",
    userId: "user-plant",
    subject: "Question about the dryer start sequence",
    message: "On rainy days paddy arrives late. Can the 10:05 start move to 10:30 on those days?",
    status: "resolved",
    createdAt: "2026-07-02",
  },
];
