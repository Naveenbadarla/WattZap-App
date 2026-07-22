import "server-only";
import { supabaseConfigured } from "@/lib/supabase/server";
import { demoRepo } from "@/lib/repo/demo";
import { supabaseRepo } from "@/lib/repo/supabase";
import type { Repository } from "@/lib/repo/types";
import type { ProductSlug, User } from "@/lib/types";

/**
 * Data access facade. Dispatches to the Supabase adapter when the env vars
 * are configured, otherwise to the seeded in-memory demo adapter. Pages and
 * services import these functions — never an adapter directly.
 */

export function repo(): Repository {
  // The Supabase client itself is created lazily inside the adapter, so
  // importing both adapters is safe in demo mode.
  return supabaseConfigured() ? supabaseRepo : demoRepo;
}

// ---- tenancy ----

export const getSite = (siteId: string) => repo().getSite(siteId);
export const sitesForUser = (user: User) => repo().sitesForUser(user);
export const listAllSites = () => repo().listAllSites();
export const listOrgUsers = (orgId: string) => repo().listOrgUsers(orgId);
export const getUserById = (id: string) => repo().getUserById(id);
export const getOrgName = (orgId: string | null) => repo().getOrgName(orgId);

export async function userCanAccessSite(user: User, siteId: string): Promise<boolean> {
  const sites = await repo().sitesForUser(user);
  return sites.some((s) => s.id === siteId);
}

// ---- reads ----

export const entitlementsForSite = (siteId: string) => repo().entitlementsForSite(siteId);
export const billsForSite = (siteId: string) => repo().billsForSite(siteId);
export const opportunitiesForSite = (siteId: string) => repo().opportunitiesForSite(siteId);
export const getOpportunity = (id: string) => repo().getOpportunity(id);
export const savingsForSite = (siteId: string) => repo().savingsForSite(siteId);
export const getSavingsEntry = (id: string) => repo().getSavingsEntry(id);
export const findSavingsByOpportunity = (oppId: string) => repo().findSavingsByOpportunity(oppId);
export const actionsForSite = (siteId: string) => repo().actionsForSite(siteId);
export const alertsForSite = (siteId: string, userId: string) =>
  repo().alertsForSite(siteId, userId);
export const reportsForSite = (siteId: string) => repo().reportsForSite(siteId);
export const documentsForSite = (siteId: string) => repo().documentsForSite(siteId);
export const onboardingForSite = (siteId: string) => repo().onboardingForSite(siteId);
export const milestonesFor = (siteId: string, product: ProductSlug) =>
  repo().milestonesFor(siteId, product);
export const pfEventsForSite = (siteId: string) => repo().pfEventsForSite(siteId);
export const demandEventsForSite = (siteId: string) => repo().demandEventsForSite(siteId);
export const todProfileForSite = (siteId: string) => repo().todProfileForSite(siteId);
export const supportRequestsForSite = (siteId: string) => repo().supportRequestsForSite(siteId);
