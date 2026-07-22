import type { Role, User } from "@/lib/types";

/** Role-based authorisation rules, enforced in server actions and pages. */

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Business Owner",
  plant_manager: "Plant Manager",
  finance: "Accounts / Finance",
  maintenance: "Maintenance",
  wattzap_internal: "WattZap Team",
};

/** Who may approve/reject savings opportunities. */
export function canDecideOpportunity(user: User): boolean {
  return ["owner", "finance", "wattzap_internal"].includes(user.role);
}

/** Who may mark operational actions complete. */
export function canCompleteAction(user: User): boolean {
  return ["owner", "plant_manager", "maintenance", "wattzap_internal"].includes(user.role);
}

/** Who may activate products / accept commercial proposals. */
export function canActivateProduct(user: User): boolean {
  return ["owner", "finance"].includes(user.role);
}

/** Who sees the WattZap internal console. */
export function isInternal(user: User): boolean {
  return user.role === "wattzap_internal";
}

/** Who can download/export documents & reports. */
export function canDownload(user: User): boolean {
  return true; // all roles in demo; production adds per-category rules
}
