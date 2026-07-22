"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Camera, Upload } from "lucide-react";
import { recordUploadAction } from "@/lib/actions";
import { CATEGORY_LABELS } from "@/lib/labels";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-brand" disabled={pending}>
      <Upload className="h-4 w-4" aria-hidden />
      {pending ? "Uploading…" : "Add document"}
    </button>
  );
}

/**
 * Demo upload: records document metadata (production stores the file in
 * Supabase Storage with signed URLs and virus scanning). Camera capture is
 * supported on mobile via the file input's `capture` attribute.
 */
export function UploadForm() {
  const [state, formAction] = useFormState(recordUploadAction, undefined);
  return (
    <details className="card p-5">
      <summary className="font-bold cursor-pointer inline-flex items-center gap-2">
        <Camera className="h-4 w-4" aria-hidden /> Upload a document (bill, meter file, photo…)
      </summary>
      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_240px_auto] items-end">
        <div>
          <label htmlFor="doc-name" className="label">Document name</label>
          <input id="doc-name" name="name" required className="input" placeholder="e.g. TGNPDCL Bill — July 2026.pdf" />
        </div>
        <div>
          <label htmlFor="doc-category" className="label">Category</label>
          <select id="doc-category" name="category" className="input">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <SubmitButton />
      </form>
      {state?.error ? <p className="text-sm text-risk-600 mt-2" role="alert">{state.error}</p> : null}
      {state?.ok ? (
        <p className="text-sm text-verified-600 mt-2" role="status">
          Document recorded. In production the file itself is stored securely and analysed —
          after a bill upload you would see: “Your bill was successfully analysed.”
        </p>
      ) : null}
      <p className="text-xs text-ink-faint mt-3">
        Supported in production: PDF, photos from your phone camera, Excel/CSV meter files.
      </p>
    </details>
  );
}
