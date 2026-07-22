import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { demoStore } from "@/lib/repo/demo";
import { repo } from "@/lib/db";
import { authClient, supabaseConfigured } from "@/lib/supabase/server";
import type { Site, User } from "@/lib/types";

/**
 * Authentication facade with two modes:
 *
 * - Supabase mode (env vars set): Supabase Auth (email/password, verification,
 *   reset) via @supabase/ssr cookies; the profile row provides role & org.
 * - Demo mode: opaque httpOnly session cookie mapped to a seeded user.
 *
 * The active site is a separate cookie in both modes, validated against the
 * user's accessible sites on every read (tenant isolation).
 */

const SESSION_COOKIE = "wz_session";
const SITE_COOKIE = "wz_active_site";

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (supabaseConfigured()) {
    const { error } = await authClient().auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: "Incorrect email or password." };
    return { ok: true };
  }
  const user = await repo().getUserByEmail(email);
  if (!user || user.password !== password) {
    return {
      ok: false,
      error: "Incorrect email or password. Try one of the demo accounts below.",
    };
  }
  const token = randomUUID();
  demoStore().sessions.set(token, {
    token,
    userId: user.id,
    activeSiteId: "",
    createdAt: new Date().toISOString(),
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export async function logout(): Promise<void> {
  if (supabaseConfigured()) {
    await authClient().auth.signOut();
  } else {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (token) demoStore().sessions.delete(token);
    cookies().delete(SESSION_COOKIE);
  }
  cookies().delete(SITE_COOKIE);
}

async function resolveUser(): Promise<User | null> {
  if (supabaseConfigured()) {
    const {
      data: { user: authUser },
    } = await authClient().auth.getUser();
    if (!authUser) return null;
    return repo().getUserById(authUser.id);
  }
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = demoStore().sessions.get(token);
  if (!session) return null;
  return repo().getUserById(session.userId);
}

export async function currentUser(): Promise<{
  user: User;
  activeSite: Site;
  sites: Site[];
} | null> {
  const user = await resolveUser();
  if (!user) return null;
  const sites = await repo().sitesForUser(user);
  if (sites.length === 0) return null;
  const requested = cookies().get(SITE_COOKIE)?.value;
  const activeSite = sites.find((s) => s.id === requested) ?? sites[0];
  return { user, activeSite, sites };
}

/** Server-component guard: redirects to /login when unauthenticated. */
export async function requireUser(): Promise<{ user: User; activeSite: Site; sites: Site[] }> {
  const ctx = await currentUser();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function switchSite(siteId: string): Promise<void> {
  const user = await resolveUser();
  if (!user) return;
  const sites = await repo().sitesForUser(user);
  if (!sites.some((s) => s.id === siteId)) return; // tenant isolation
  cookies().set(SITE_COOKIE, siteId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
