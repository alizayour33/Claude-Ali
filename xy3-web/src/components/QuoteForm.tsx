"use client";

import { useState, type FormEvent } from "react";
import type { Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { whatsappLink } from "@/lib/site";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string; fallback: string };
type Option = { slug: string; name: string; type: string };

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/10";
const label = "mb-1.5 block text-sm font-semibold";

export function QuoteForm({ lang, t, machines, defaultMachine = "" }: { lang: Lang; t: Dict["form"]; machines: Option[]; defaultMachine?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const machineName = machines.find((m) => m.slug === data.machine)?.name ?? t.notSure;
    const fallback = whatsappLink(
      `${t.waIntro} ${data.name} (${data.company || "-"}, ${data.country || "-"})\n${t.waMachine}: ${machineName}, ${t.waQty}: ${data.quantity || "-"}\n${data.message}`,
    );

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus({ kind: "sent" });
        form.reset();
      } else {
        setStatus({ kind: "error", message: body.error ?? t.genericError, fallback });
      }
    } catch {
      setStatus({ kind: "error", message: t.networkError, fallback });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="rounded-3xl border border-line bg-white p-10 text-center" role="status">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-mint text-3xl">✓</div>
        <h2 className="text-2xl font-extrabold">{t.sentTitle}</h2>
        <p className="mt-3 text-muted">{t.sentText}</p>
        <button onClick={() => setStatus({ kind: "idle" })} className="mt-6 font-bold text-brand hover:underline">
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-[0_24px_60px_rgba(26,11,69,.08)] sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>{t.name}</label>
          <input id="name" name="name" required maxLength={100} autoComplete="name" className={field} placeholder={t.ph.name} />
        </div>
        <div>
          <label htmlFor="company" className={label}>{t.company}</label>
          <input id="company" name="company" maxLength={120} autoComplete="organization" className={field} placeholder={t.ph.company} />
        </div>
        <div>
          <label htmlFor="email" className={label}>{t.email}</label>
          <input id="email" name="email" type="email" dir="ltr" required maxLength={160} autoComplete="email" className={`${field} rtl:text-right`} placeholder={t.ph.email} />
        </div>
        <div>
          <label htmlFor="phone" className={label}>{t.phone}</label>
          <input id="phone" name="phone" type="tel" dir="ltr" maxLength={40} autoComplete="tel" className={`${field} rtl:text-right`} placeholder={t.ph.phone} />
        </div>
        <div>
          <label htmlFor="country" className={label}>{t.country}</label>
          <input id="country" name="country" required maxLength={80} autoComplete="country-name" className={field} placeholder={t.ph.country} />
        </div>
        <div>
          <label htmlFor="quantity" className={label}>{t.quantity}</label>
          <select id="quantity" name="quantity" className={field} defaultValue="">
            <option value="">{t.select}</option>
            {t.qty.map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="machine" className={label}>{t.machine}</label>
          <select id="machine" name="machine" className={field} defaultValue={defaultMachine}>
            <option value="">{t.notSure}</option>
            {machines.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={label}>{t.message}</label>
          <textarea id="message" name="message" required minLength={10} maxLength={3000} rows={5} className={field} placeholder={t.ph.message} />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {status.kind === "error" && (
        <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm" role="alert">
          <p className="font-semibold text-amber-900">{status.message}</p>
          <a href={status.fallback} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-bold text-leaf-deep hover:underline">
            {t.fallback}
          </a>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-muted">{t.privacy}</p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 font-bold text-white shadow-[0_10px_24px_rgba(109,58,240,.28)] transition hover:-translate-y-0.5 hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "sending" ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
