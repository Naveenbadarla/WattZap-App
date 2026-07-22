# Deploying WattZap to production (Supabase + Vercel)

The app runs in two modes, decided automatically by environment variables:

| Mode | When | Data | Auth |
|---|---|---|---|
| **Demo** | No Supabase env vars | Seeded in-memory store (resets on restart) | Demo cookie sessions |
| **Production** | Supabase env vars set | Supabase PostgreSQL with RLS | Supabase Auth (email/password, verification, reset) |

No code changes are needed to switch — set the env vars and restart.

## 1. Create the Supabase project (~10 minutes)

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine for a pilot).
   Choose a region close to your customers (e.g. `ap-south-1`, Mumbai).
2. In the dashboard, open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql` (schema, enums, RLS policies, product catalog)
   - `supabase/migrations/0002_adapter_support.sql` (activity trail, TOD profile, display-name columns)
3. Collect three values from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never expose)

## 2. Seed the demo customer

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role key> \
npm run seed:supabase
```

This creates the five demo auth accounts (password `demo1234`), both sites and the
full Venkata Sai dataset. The script is idempotent — re-run it any time to reset
the demo data. Requires Node 22.18+.

## 3. Verify locally

```bash
cp .env.example .env.local   # fill in the three Supabase values
npm run dev
```

Sign in with `owner@venkatasai.in` / `demo1234`. You are now running against
PostgreSQL — approvals, activations and uploads persist across restarts.

## 4. Deploy to Vercel (~5 minutes)

1. [vercel.com](https://vercel.com) → **Add New Project** → import `Naveenbadarla/WattZap-App`.
2. Framework preset: **Next.js** (auto-detected). No build settings to change.
3. Add the three environment variables under **Settings → Environment Variables**.
4. Deploy. You get a shareable `https://<app>.vercel.app` URL.

To demo without Supabase, deploy with **no** env vars — the app runs in demo mode
(note: in-memory state may reset between serverless invocations, so approvals may
not stick; use Supabase mode for anything customer-facing).

## 5. Production hardening checklist (before real customer data)

- [ ] Turn on **email confirmation required** in Supabase Auth settings.
- [ ] Set a custom SMTP sender for auth emails (Supabase → Auth → SMTP).
- [ ] Replace demo accounts with real users; rotate all demo passwords.
- [ ] Create a Supabase Storage bucket (`documents`) with per-site path policies
      before enabling real file upload.
- [ ] Enable Vercel/Supabase backups and log drains.
- [ ] Add a custom domain (e.g. `app.wattzap.in`) in Vercel.
