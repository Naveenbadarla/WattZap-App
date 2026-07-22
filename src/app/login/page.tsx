import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { WattZapLogo } from "@/components/icons";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  if (currentUser()) redirect("/");
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <WattZapLogo className="scale-125" />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-bold">Sign in to your Savings Command Centre</h1>
          <p className="text-ink-muted text-sm mt-1 mb-6">
            Measured savings, not equipment sales.
          </p>
          <LoginForm />
        </div>

        <div className="card p-5 mt-4">
          <h2 className="text-sm font-bold mb-2">Demo accounts (password: demo1234)</h2>
          <ul className="text-sm text-ink-soft space-y-1.5">
            <li>
              <span className="font-semibold">owner@venkatasai.in</span> — Business Owner (both sites)
            </li>
            <li>
              <span className="font-semibold">plant@venkatasai.in</span> — Plant Manager (Rice Mill)
            </li>
            <li>
              <span className="font-semibold">accounts@venkatasai.in</span> — Accounts / Finance
            </li>
            <li>
              <span className="font-semibold">maintenance@venkatasai.in</span> — Maintenance
            </li>
            <li>
              <span className="font-semibold">analyst@wattzap.in</span> — WattZap internal analyst
            </li>
          </ul>
        </div>
        <p className="text-center text-xs text-ink-faint mt-4">
          Demo environment with seeded data. Production uses Supabase Auth with email
          verification and password reset.
        </p>
      </div>
    </main>
  );
}
