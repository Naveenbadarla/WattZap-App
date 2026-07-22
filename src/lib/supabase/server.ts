import "server-only";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase server-side clients.
 *
 * - `supabaseConfigured()` decides which backend the app runs on. With no env
 *   vars the app uses the in-memory demo adapter and nothing here is called.
 * - `serviceClient()` uses the service-role key. It BYPASSES Row Level
 *   Security, so it must only ever be reached through code paths that have
 *   already done session + tenant + role checks (see src/lib/actions.ts and
 *   the repository layer). It never leaves the server.
 * - `authClient()` is the per-request client bound to the user's auth
 *   cookies; used for sign-in/sign-out/getUser.
 */

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

let cachedService: SupabaseClient | null = null;

export function serviceClient(): SupabaseClient {
  if (!cachedService) {
    cachedService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return cachedService;
}

export function authClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore; the
            // middleware/action path performs the actual refresh writes.
          }
        },
      },
    }
  );
}
