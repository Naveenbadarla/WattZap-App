"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AppIcon, WattZapLogo } from "@/components/icons";
import type { NavItem } from "@/lib/entitlements";

/**
 * Progressive navigation shell: fixed sidebar on desktop, top bar with a
 * slide-down menu on mobile. Items are computed server-side per site from
 * activated products (see navForSite) and passed in as data.
 */
export function AppNav({
  items,
  siteSwitcher,
  userMenu,
}: {
  items: NavItem[];
  siteSwitcher: React.ReactNode;
  userMenu: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkCls = (href: string) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px] ${
      isActive(href)
        ? "bg-brand-100 text-ink font-semibold"
        : "text-ink-soft hover:bg-stone-100"
    }`;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-stone-200 bg-white z-30">
        <div className="px-5 py-5 border-b border-stone-100">
          <Link href="/" aria-label="WattZap home">
            <WattZapLogo />
          </Link>
        </div>
        <div className="px-3 py-3 border-b border-stone-100">{siteSwitcher}</div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1" aria-label="Main navigation">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(item.href)}>
              <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-stone-100 p-3">{userMenu}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-stone-200 bg-white px-4 py-3">
        <Link href="/" aria-label="WattZap home">
          <WattZapLogo />
        </Link>
        <button
          type="button"
          className="btn-ghost !px-3"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>
      {open ? (
        <div className="lg:hidden fixed inset-0 top-[61px] z-40 bg-white overflow-y-auto">
          <div className="p-4 border-b border-stone-100">{siteSwitcher}</div>
          <nav className="p-4 space-y-1" aria-label="Main navigation" onClick={() => setOpen(false)}>
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={linkCls(item.href)}>
                <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-100 p-4">{userMenu}</div>
        </div>
      ) : null}
    </>
  );
}
