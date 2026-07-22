"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card p-8 text-center max-w-lg mx-auto mt-10">
      <h2 className="text-lg font-bold">Something went wrong</h2>
      <p className="text-ink-muted mt-1 text-sm">
        {error.message || "An unexpected error occurred. Your data is safe."}
      </p>
      <button type="button" onClick={reset} className="btn-brand mt-4">
        Try again
      </button>
    </div>
  );
}
