"use client";

import { useState } from "react";
import { MessageCircleQuestion, Send, X } from "lucide-react";

/**
 * WattZap Coach — a contextual explainer, not a generic chatbot.
 * Talks to /api/coach, which answers only from the signed-in customer's
 * authorised data via a rule-based service (AI model pluggable later).
 */

const SUGGESTED = [
  "Why is my bill higher?",
  "What is power factor?",
  "Which action should I do first?",
  "Why is my verified saving lower than expected?",
  "Which WattZap product should I activate next?",
  "Is solar suitable for my site?",
];

interface Msg {
  role: "user" | "coach";
  text: string;
}

export function Coach({ context }: { context?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "coach", text: data.answer ?? "Sorry, I could not answer that right now." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "coach", text: "I could not reach the WattZap service. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink text-white px-4 py-3 shadow-card-hover hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        aria-label="Open WattZap Coach"
      >
        <MessageCircleQuestion className="h-5 w-5" aria-hidden />
        <span className="hidden sm:inline text-sm font-semibold">Ask WattZap Coach</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="WattZap Coach"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="flex h-[85vh] sm:h-[600px] w-full sm:max-w-md flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-card-hover">
            <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
              <div>
                <p className="font-bold">WattZap Coach</p>
                <p className="text-xs text-ink-muted">
                  Explains your energy situation in plain language
                </p>
              </div>
              <button type="button" className="btn-ghost !px-3" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div>
                  <p className="text-sm text-ink-muted mb-3">
                    Ask me anything about your site. Common questions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        className="rounded-full border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                    m.role === "user"
                      ? "ml-auto bg-ink text-white"
                      : "bg-stone-100 text-ink"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {busy ? <p className="text-sm text-ink-faint">Coach is thinking…</p> : null}
            </div>

            <form
              className="flex items-center gap-2 border-t border-stone-100 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
            >
              <label htmlFor="coach-input" className="sr-only">
                Your question
              </label>
              <input
                id="coach-input"
                className="input"
                placeholder="Type your question…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn-brand !px-3.5" disabled={busy} aria-label="Send">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
