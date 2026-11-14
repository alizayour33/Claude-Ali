"use client";

import { useState, type FormEvent } from "react";
import { machines } from "@/lib/machines";
import { whatsappLink } from "@/lib/site";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; fallback: string };

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";
const label = "mb-1.5 block text-sm font-semibold";

export function QuoteForm({ defaultMachine = "" }: { defaultMachine?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const machineName = machines.find((m) => m.slug === data.machine)?.name ?? "Not sure yet";
    const fallback = whatsappLink(
      `Quote request from ${data.name} (${data.company || "-"}, ${data.country || "-"})\nMachine: ${machineName}, Qty: ${data.quantity || "-"}\n${data.message}`,
    );

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus({ kind: "sent" });
        form.reset();
      } else {
        setStatus({
          kind: "error",
          message: body.error ?? "Something went wrong sending your request.",
          fallback,
        });
      }
    } catch {
      setStatus({ kind: "error", message: "Network error: your request wasn't sent.", fallback });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="rounded-3xl border border-line bg-white p-10 text-center" role="status">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-mint text-3xl">✓</div>
        <h2 className="text-2xl font-extrabold">Thanks, your request is in!</h2>
        <p className="mt-3 text-muted">A sales manager will reply within 24 hours with pricing and next steps.</p>
        <button onClick={() => setStatus({ kind: "idle" })} className="mt-6 font-bold text-brand hover:underline">
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_60px_rgba(26,11,69,.08)] sm:p-9" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>Full name *</label>
          <input id="name" name="name" required maxLength={100} autoComplete="name" className={field} placeholder="Jane Doe" />
        </div>
        <div>
          <label htmlFor="company" className={label}>Company</label>
          <input id="company" name="company" maxLength={120} autoComplete="organization" className={field} placeholder="Company name" />
        </div>
        <div>
          <label htmlFor="email" className={label}>Email *</label>
          <input id="email" name="email" type="email" required maxLength={160} autoComplete="email" className={field} placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone / WhatsApp</label>
          <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className={field} placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label htmlFor="country" className={label}>Country *</label>
          <input id="country" name="country" required maxLength={80} autoComplete="country-name" className={field} placeholder="Where will machines be placed?" />
        </div>
        <div>
          <label htmlFor="quantity" className={label}>Quantity</label>
          <select id="quantity" name="quantity" className={field} defaultValue="">
            <option value="">Select…</option>
            <option>1 (pilot)</option>
            <option>2–5</option>
            <option>6–20</option>
            <option>20+</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="machine" className={label}>Machine of interest</label>
          <select id="machine" name="machine" className={field} defaultValue={defaultMachine}>
            <option value="">Not sure yet, please recommend</option>
            {machines.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>Tell us about the project *</label>
          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={5}
            className={field}
            placeholder="Venue type, the client's brand, menu ideas, timeline…"
          />
        </div>
        {/* honeypot */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {status.kind === "error" && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm" role="alert">
          <p className="font-semibold text-amber-900">{status.message}</p>
          <a href={status.fallback} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold text-leaf-deep hover:underline">
            Send it on WhatsApp instead →
          </a>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">We reply within 24 hours. Your details are used only to answer this request.</p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(109,58,240,.28)] transition hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Request Quote →"}
        </button>
      </div>
    </form>
  );
}
