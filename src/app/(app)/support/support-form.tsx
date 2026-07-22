"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSupportRequestAction } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-brand" disabled={pending}>
      {pending ? "Sending…" : "Send request"}
    </button>
  );
}

export function SupportForm() {
  const [state, formAction] = useFormState(createSupportRequestAction, undefined);
  return (
    <div className="card p-5">
      <h2 className="font-bold mb-3">Send us a message</h2>
      <form action={formAction} className="space-y-3">
        <div>
          <label htmlFor="subject" className="label">Subject</label>
          <input id="subject" name="subject" required className="input" placeholder="e.g. Question about my March bill" />
        </div>
        <div>
          <label htmlFor="message" className="label">Message</label>
          <textarea id="message" name="message" rows={4} required className="input !min-h-[100px]" placeholder="Tell us what you need help with…" />
        </div>
        {state?.error ? <p className="text-sm text-risk-600" role="alert">{state.error}</p> : null}
        {state?.ok ? (
          <p className="text-sm text-verified-600" role="status">
            Request sent. Your customer success manager will reply within one working day.
          </p>
        ) : null}
        <SubmitButton />
      </form>
    </div>
  );
}
