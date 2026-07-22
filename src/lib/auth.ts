import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { db, sitesForUser, userCanAccessSite } from "@/lib/db";
import type { Site, User } from "@/lib/types";

/**
 * Demo authentication: opaque session token in an httpOnly cookie, mapped
 * to a user server-side. Production replaces this module with Supabase Auth
 * (email verification, password reset, MFA) behind the same interface.
 */

const COOKIE = "wz_session";

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const user = db().users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );
  if (!user || user.password !== password) {
    return { ok: false, error: "Incorrect email or password. Try one of the demo accounts below." };
  }
  const token = randomUUID();
  const defaultSite = sitesForUser(user)[0];
  db().sessions.set(token, {
    token,
    userId: user.id,
    activeSiteId: defaultSite?.id ?? "",
    createdAt: new Date().toISOString(),
  });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { ok: true };
}

export function logout(): void {
  const token = cookies().get(COOKIE)?.value;
  if (token) db().sessions.delete(token);
  cookies().delete(COOKIE);
}

export function currentUser(): { user: User; activeSite: Site; sites: Site[] } | null {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  const session = db().sessions.get(token);
  if (!session) return null;
  const user = db().users.find((u) => u.id === session.userId);
  if (!user) return null;
  const sites = sitesForUser(user);
  const activeSite = sites.find((s) => s.id === session.activeSiteId) ?? sites[0];
  if (!activeSite) return null;
  return { user, activeSite, sites };
}

/** Server-component guard: redirects to /login when unauthenticated. */
export function requireUser(): { user: User; activeSite: Site; sites: Site[] } {
  const ctx = currentUser();
  if (!ctx) redirect("/login");
  return ctx;
}

export function switchSite(siteId: string): void {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return;
  const session = db().sessions.get(token);
  if (!session) return;
  const user = db().users.find((u) => u.id === session.userId);
  if (!user || !userCanAccessSite(user, siteId)) return; // tenant isolation
  session.activeSiteId = siteId;
}
