# WattZap Savings Command Centre

A customer-facing web application for **WattZap Energy Solutions**, built around one
principle: **measured savings, not equipment sales.**

The app takes an Indian industrial customer (rice mills, cold storages, poultry farms,
food processors, manufacturing SMEs, warehouses) on a guided journey:

> **Diagnose → Protect → Optimise → Generate → Finance → Prove**

At every step the customer can see, in plain language: what is happening at their site,
where money is being lost, what WattZap recommends, what action is required, how much can
be saved, which product enables it, and — crucially — whether the saving was actually
**measured and verified**.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No environment variables are needed for the demo build — it ships with an in-memory,
seeded data layer (see “Architecture” below). `npm run build && npm start` for production
mode. `npm run typecheck` and `npm run lint` must pass.

**Running on Supabase (persistent data + real auth):** the app switches to its
Supabase adapter automatically when `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set. Run the two
migrations, seed with `npm run seed:supabase`, and deploy — full walkthrough in
[DEPLOYMENT.md](./DEPLOYMENT.md).

### Test accounts (password for all: `demo1234`)

| Email | Role | Access |
|---|---|---|
| `owner@venkatasai.in` | Business Owner | Both sites, can approve/reject & activate products |
| `plant@venkatasai.in` | Plant Manager | Rice Mill only, operational actions |
| `accounts@venkatasai.in` | Accounts / Finance | Both sites, bills & approvals |
| `maintenance@venkatasai.in` | Maintenance | Rice Mill only, action checklists |
| `analyst@wattzap.in` | WattZap internal (energy analyst) | All sites + WattZap Console |

### Seeded demo customer

**Venkata Sai Agro Industries** with two sites:

- **Venkata Sai Rice Mill** (Nizamabad, HT 11 kV) — maturity level 1 (*Historical
  Diagnosis*): 12 months of bills + MRI meter files uploaded, EnergyScan Pro completed
  (7 opportunities ≈ ₹8.7 lakh/yr), PF Guard **active** with one **verified** saving
  (₹1.25 lakh/yr), Demand Guard **recommended** (11 spikes/90 days), EMS Lite in
  **onboarding** (survey scheduled), SolarFit draft ready (150 kW), Savings Assurance
  baseline in preparation. The site is deliberately **not** live-connected — the UI
  says so honestly everywhere.
- **Venkata Sai Cold Storage** (Karimnagar) — early stage: EnergyScan Lite done,
  3 of 12 bills uploaded, EnergyScan Pro recommended. Demonstrates progressive
  navigation and locked-product explanations.

---

## What is implemented

- **Auth & roles** — cookie-session login, five roles, role-gated server actions
  (approve/reject, complete actions, activate products), WattZap-internal console
  hidden from customers (renders 404).
- **Tenant isolation** — every read/write path resolves the user's accessible sites;
  a plant manager literally cannot see the other site anywhere.
- **Product entitlement system (backend)** — per-site, per-product states
  (`locked / preview / eligible / recommended / trial / onboarding / active / completed
  / suspended / expired / cancelled`) stored in the data layer with configurable
  unlocking rules, plain-language state reasons and unlock steps. The frontend never
  decides access.
- **Progressive navigation** — the menu grows as products activate (new customer sees
  4 items; the rice mill sees the full set).
- **Home dashboard** — answers “Are we okay? Are we losing money? What should we do?
  How much has WattZap saved us?” in one screen: site health, money at risk, savings
  pipeline, single top action, what changed, recent progress, maturity level.
- **Savings Journey** — six-stage visual map (horizontal grid on desktop, vertical
  steps on mobile) with per-stage status, products, savings and next action.
- **Savings Wallet** — Identified → Approved → Implemented → Measured → Verified
  pipeline, ledger, product-wise and site-wise splits, and full drill-down per entry:
  baseline, measurement period, method, adjustments, variance explanation
  (expected ₹12,500/mo vs verified ₹10,400/mo, production +9%), reviewer, approver,
  evidence.
- **Opportunities** — decision cards with plain explanation, value, cost, payback,
  confidence, complexity, decision owner, evidence, expandable technical detail,
  approve/reject (role-checked, syncs the savings ledger), questions/comments and a
  full activity history.
- **Product modules** — EnergyScan (Lite/Pro), PF Guard, Demand Guard, Bill Guard,
  Solar Guard, EMS Lite, WattZap Edge, SolarFit, SolarLease, Savings Assurance. Each
  shows real module content when usable, and an honest “what it does / expected value /
  how to unlock” view when locked. EMS Lite shows a truthful “no live data yet” state
  plus the 7-step onboarding tracker. SolarLease is explicitly *not* auto-approved.
- **Alerts** — six categories, sorted by financial impact & urgency; every alert has
  what/when/impact/why/action/deadline/owner/product/evidence and mark-as-read.
- **Multi-site portfolio** — totals, health, per-site products, and a
  production-normalised comparison line.
- **Reports & Documents** — versioned reports with review/approval status; document
  categories with a demo upload flow (metadata recorded, value message shown).
- **Onboarding** — 8-step guided flow with immediate-value messages after each step.
- **WattZap Coach** — floating contextual assistant. Rule-based v1 answers only from
  the signed-in customer's site data via `/api/coach` (session-checked, zod-validated);
  the interface is shaped so an LLM backend can be plugged in without client changes.
- **Data provenance everywhere** — every number carries a visible tag:
  `Historical / Uploaded / Estimated / Simulated / Live / Verified ✓`.
- **States** — loading skeletons, empty states with next steps, locked/eligible/
  onboarding/active product states, permission-denied messaging, error boundary, 404.
- **Design system** — warm light UI, WattZap yellow accent, green strictly for
  verified savings, amber for attention, red only for real risk; Indian currency
  formatting (₹45,000 / ₹1.8 lakh / ₹1.2 crore), large tap targets, keyboard-focus
  styles, mobile-first layouts, PWA manifest.

## Architecture

```
src/
  app/
    login/                  # public
    (app)/                  # authenticated shell (sidebar / mobile nav / Coach)
      page.tsx              # Home dashboard
      journey/  sites/  opportunities/[id]  savings/[id]  alerts/
      products/[slug]       # all 11 product modules
      reports/  documents/  onboarding/  settings/  support/  internal/
    api/coach/              # Coach service endpoint
  components/               # ui primitives, domain components, charts, nav, coach
  lib/
    types.ts                # domain model (mirrors SQL schema)
    data/seed.ts            # realistic demo dataset (all tagged, nothing fake-live)
    data/products.ts        # product catalog + configurable entitlement rules
    repo/types.ts           # Repository contract (the persistence seam)
    repo/demo.ts            # adapter 1: seeded in-memory store
    repo/supabase.ts        # adapter 2: Supabase/PostgreSQL
    supabase/server.ts      # Supabase clients (service-role + auth cookies)
    db.ts                   # data-access facade (dispatches by env)
    auth.ts                 # auth facade (Supabase Auth or demo sessions)
    permissions.ts          # role rules
    entitlements.ts         # entitlement/journey/navigation services
    savings.ts              # wallet aggregation
    actions.ts              # ALL writes: auth → tenant check → role check → zod → audit
scripts/seed-supabase.mjs   # seeds a Supabase project with the demo dataset
supabase/migrations/        # full production schema + RLS policies
```

Separation of concerns: UI components never contain business rules; all mutations go
through server actions; entitlement, journey, savings and permission logic live in
`src/lib` services; persistence sits behind the `Repository` interface with two
interchangeable adapters.

### Two persistence modes

- **Demo (default, no env vars):** in-memory store cached on `globalThis`, cloned
  from the seed on first access. Mutations work and persist for the life of the
  server process, then reset — ideal for demos.
- **Supabase (env vars set):** same repository contract against PostgreSQL with Row
  Level Security, and Supabase Auth for sign-in, email verification and password
  reset. Setup guide: [DEPLOYMENT.md](./DEPLOYMENT.md).

## Security model

- httpOnly, SameSite=Lax session cookie; opaque token → server-side session.
- Every server action: session check → tenant check (`userCanAccessSite`) → role
  check (`permissions.ts`) → zod input validation → activity/audit event.
- Multi-tenant isolation duplicated at the database layer via RLS
  (`accessible_site_ids()` in the migration) so a leaked query can't cross tenants.
- No secrets in the frontend; Coach endpoint only serves the caller's own site data.
- Internal console is invisible (404) to customer roles.

## Deliberate scope choices & assumptions

- **Calculation engines** (tariff engine, baseline regression, M&V, solar yield) are
  clean service interfaces with realistic placeholder outputs, always tagged
  `estimated`. Final engines slot in behind `lib/savings.ts` / opportunity data.
- **PDF generation, WhatsApp/SMS delivery, payments** are stubbed with honest UI
  labels; integration points are documented above.
- **File upload** records metadata only in the demo (no binary storage in-memory).
- Savings snapshot figures are cumulative: “Approved” includes everything at approved
  stage or beyond, etc.
- The rice mill is intentionally at Level 1 — nowhere does the app pretend live or
  automated capability that the data can't support.

## Future integrations / roadmap

1. Supabase adapter (auth, Postgres, storage) — schema already shipped.
2. Meter/MRI file parsers and DISCOM bill OCR ingestion pipeline.
3. WattZap Edge telemetry ingestion (MQTT) + data-freshness engine for EMS Lite.
4. Tariff engine per DISCOM; baseline & M&V engine (IPMVP-style) for Savings Assurance.
5. Claude-powered WattZap Coach behind the existing `/api/coach` contract.
6. WhatsApp Business / SMS notification channels honouring notification preferences.
7. Hindi / Telugu translations (UI copy is already centralised and translation-ready).
8. Payments & subscription billing for guard products.
9. Level 5 roadmap: automated multi-asset optimisation (solar + battery + flexible loads).

## Verification

`npm run build` (includes type-checking and lint) passes, and a Playwright smoke test
exercised: login for all roles, dashboard content, journey states, opportunity
approve flow syncing the wallet, savings drill-down, locked/recommended/onboarding
product pages, alerts, portfolio comparison, Coach API, internal-console gating,
tenant scoping, and mobile navigation.
