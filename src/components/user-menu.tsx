import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { ROLE_LABELS } from "@/lib/permissions";
import type { User } from "@/lib/types";

export function UserMenu({ user }: { user: User }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{user.name}</p>
        <p className="text-xs text-ink-muted truncate">{ROLE_LABELS[user.role]}</p>
      </div>
      <form action={logoutAction}>
        <button type="submit" className="btn-ghost !px-3" title="Sign out" aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
