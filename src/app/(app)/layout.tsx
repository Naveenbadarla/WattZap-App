import { requireUser } from "@/lib/auth";
import { navForSite } from "@/lib/entitlements";
import { isInternal } from "@/lib/permissions";
import { AppNav } from "@/components/nav";
import { SiteSwitcher } from "@/components/site-switcher";
import { UserMenu } from "@/components/user-menu";
import { Coach } from "@/components/coach";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, activeSite, sites } = await requireUser();
  const items = await navForSite(activeSite, isInternal(user));

  return (
    <div className="min-h-screen bg-surface">
      <AppNav
        items={items}
        siteSwitcher={
          <SiteSwitcher
            sites={sites.map((s) => ({ id: s.id, name: s.name, location: s.location }))}
            activeSiteId={activeSite.id}
          />
        }
        userMenu={<UserMenu user={user} />}
      />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-24">{children}</div>
      </main>
      <Coach />
    </div>
  );
}
