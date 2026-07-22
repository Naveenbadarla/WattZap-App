"use client";

import { useRef } from "react";
import { Factory } from "lucide-react";
import { switchSiteAction } from "@/lib/actions";

export function SiteSwitcher({
  sites,
  activeSiteId,
}: {
  sites: { id: string; name: string; location: string }[];
  activeSiteId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  if (sites.length <= 1) {
    const site = sites[0];
    return site ? (
      <div className="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2.5 text-sm">
        <Factory className="h-4 w-4 text-ink-muted shrink-0" aria-hidden />
        <span className="font-medium truncate">{site.name}</span>
      </div>
    ) : null;
  }
  return (
    <form ref={formRef} action={switchSiteAction}>
      <label htmlFor="site-select" className="sr-only">
        Choose site
      </label>
      <select
        id="site-select"
        name="siteId"
        defaultValue={activeSiteId}
        onChange={() => formRef.current?.requestSubmit()}
        className="input !py-2 font-medium"
      >
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} — {s.location}
          </option>
        ))}
      </select>
    </form>
  );
}
