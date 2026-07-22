import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card p-8 text-center max-w-md">
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="text-ink-muted mt-1 text-sm">
          This page does not exist or you do not have permission to view it.
        </p>
        <Link href="/" className="btn-brand mt-4">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
