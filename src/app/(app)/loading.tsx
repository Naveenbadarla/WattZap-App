export default function Loading() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <div className="h-8 w-64 rounded-lg bg-stone-200 animate-pulse" />
      <div className="h-4 w-96 max-w-full rounded bg-stone-100 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-card bg-stone-100 animate-pulse" />
        <div className="h-36 rounded-card bg-stone-100 animate-pulse" />
      </div>
      <div className="h-24 rounded-card bg-stone-100 animate-pulse" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
