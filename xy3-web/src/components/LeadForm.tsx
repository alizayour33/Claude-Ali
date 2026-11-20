"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Content } from "@/content";
import { track } from "@/lib/track";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "select" | "textarea" | "file" | "chips";
  required?: boolean;
  options?: string[];
  full?: boolean;
  autoComplete?: string;
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; reference: string; demo: boolean } | { kind: "error"; message: string };

const MAX_FILES = 3;
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4"];
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

const control =
  "min-h-11 w-full rounded-lg border border-ink/20 bg-white px-3.5 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-flame focus:ring-2 focus:ring-flame/20";

/** Remember where the visitor came from (first page of the visit) for lead attribution. */
function attribution() {
  try {
    const saved = sessionStorage.getItem("xy3_source");
    if (saved) return JSON.parse(saved) as Record<string, string>;
    const q = new URLSearchParams(location.search);
    const data: Record<string, string> = { landing_page: location.pathname, referrer: document.referrer };
    UTM_KEYS.forEach((k) => { const v = q.get(k); if (v) data[k] = v; });
    sessionStorage.setItem("xy3_source", JSON.stringify(data));
    return data;
  } catch {
    return {};
  }
}

export function LeadForm({
  kind,
  fields,
  t,
  labels,
  defaults = {},
  showReference = false,
}: {
  kind: "project" | "support" | "partner";
  fields: Field[];
  t: Content["form"];
  labels: { submit: string; okTitle: string; okText: string; reference?: string };
  defaults?: Record<string, string>;
  showReference?: boolean;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fileError, setFileError] = useState("");
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => { attribution(); }, []);
  useEffect(() => { if (status.kind === "sent" || status.kind === "error") result.current?.focus(); }, [status]);

  function checkFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (files.length > MAX_FILES) return t.upload.tooMany;
    if (files.some((f) => !TYPES.includes(f.type))) return t.upload.badType;
    if (files.reduce((n, f) => n + f.size, 0) > MAX_BYTES) return t.upload.tooBig;
    return "";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const err = checkFiles(fileInput?.files ?? null);
    setFileError(err);
    if (err) return;

    const data = new FormData(form);
    data.set("kind", kind);
    Object.entries(attribution()).forEach(([k, v]) => data.set(`src_${k}`, v));

    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", { method: "POST", body: data });
      const body = (await res.json().catch(() => ({}))) as { reference?: string; demo?: boolean; error?: string };
      if (res.ok && body.reference) {
        track(`form_submit_${kind}`, { reference: body.reference });
        setStatus({ kind: "sent", reference: body.reference, demo: Boolean(body.demo) });
      } else {
        setStatus({ kind: "error", message: body.error ?? t.network });
      }
    } catch {
      setStatus({ kind: "error", message: t.network });
    }
  }

  if (status.kind === "sent") {
    return (
      <div ref={result} tabIndex={-1} role="status" className="rounded-xl border border-line bg-white p-8 outline-none sm:p-10" data-form-success>
        <span className="grid size-12 place-items-center rounded-full bg-flame-soft text-flame">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">{labels.okTitle}</h2>
        <p className="mt-2 text-muted">{labels.okText}</p>
        {showReference && (
          <p className="mt-6 rounded-lg border border-line bg-ivory p-4">
            <span className="block text-xs font-bold uppercase tracking-[.14em] text-muted">{labels.reference}</span>
            <span className="mt-1 block select-all font-display text-2xl font-extrabold tracking-wide" data-reference>{status.reference}</span>
          </p>
        )}
        {status.demo && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{t.demo}</p>}
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-6 min-h-11 text-sm font-bold text-flame underline-offset-4 hover:underline">
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-5 sm:p-8" data-lead-form={kind} noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${kind}-${f.name}`;
          const wide = f.full || f.type === "textarea" || f.type === "file" || f.type === "chips";
          const label = (
            <>
              {f.label}
              {f.required ? <span className="text-flame" aria-hidden="true"> *</span> : <span className="font-normal text-muted"> ({t.optional})</span>}
            </>
          );
          if (f.type === "chips") {
            return (
              <fieldset key={f.name} className="sm:col-span-2">
                <legend className="mb-2.5 text-sm font-bold">{label}</legend>
                <div className="flex flex-wrap gap-2">
                  {f.options!.map((o, i) => (
                    <label key={o} className="cursor-pointer">
                      <input type="radio" name={f.name} value={o} required={f.required} defaultChecked={defaults[f.name] ? defaults[f.name] === o : i === 0} className="peer sr-only" />
                      <span className="inline-flex min-h-11 items-center rounded-full border border-ink/20 px-4 text-sm font-semibold transition-colors peer-checked:border-flame peer-checked:bg-flame peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-flame/40">
                        {o}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }
          return (
            <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
              <label htmlFor={id} className="mb-1.5 block text-sm font-bold">{label}</label>
              {f.type === "select" ? (
                <select id={id} name={f.name} required={f.required} defaultValue={defaults[f.name] ?? ""} className={control}>
                  <option value="">{t.select}</option>
                  {f.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "textarea" ? (
                <textarea id={id} name={f.name} required={f.required} minLength={f.required ? 10 : undefined} maxLength={4000} rows={5} className={control} />
              ) : f.type === "file" ? (
                <>
                  <input
                    id={id}
                    name="files"
                    type="file"
                    multiple
                    accept={TYPES.join(",")}
                    aria-describedby={`${id}-hint`}
                    onChange={(e) => setFileError(checkFiles(e.target.files))}
                    className="block w-full text-sm text-muted file:me-3 file:min-h-11 file:cursor-pointer file:rounded-lg file:border file:border-solid file:border-ink/25 file:bg-white file:px-4 file:text-sm file:font-bold file:text-ink hover:file:border-ink"
                  />
                  <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">{t.upload.hint}</p>
                  {fileError && <p role="alert" className="mt-1.5 text-sm font-semibold text-red-700">{fileError}</p>}
                </>
              ) : (
                <input
                  id={id}
                  name={f.name}
                  type={f.type ?? "text"}
                  inputMode={f.type === "tel" ? "tel" : f.type === "email" ? "email" : undefined}
                  required={f.required}
                  maxLength={200}
                  autoComplete={f.autoComplete}
                  defaultValue={defaults[f.name] ?? ""}
                  className={control}
                />
              )}
            </div>
          );
        })}

        {/* Honeypot: hidden from people, filled by bots. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor={`${kind}-website2`}>Leave this empty</label>
          <input id={`${kind}-website2`} name="company_url" tabIndex={-1} autoComplete="off" />
        </div>

        <label className="flex items-start gap-3 text-sm text-muted sm:col-span-2">
          <input type="checkbox" name="consent" value="yes" required className="mt-0.5 size-5 flex-none accent-[#C2500F]" />
          <span>{t.consent}</span>
        </label>
      </div>

      {status.kind === "error" && (
        <div ref={result} tabIndex={-1} role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm outline-none">
          <p className="font-bold text-red-800">{t.errorTitle}</p>
          <p className="mt-1 text-red-800">{status.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-flame px-8 text-[13px] font-bold uppercase tracking-[.08em] text-white transition-colors hover:bg-flame-deep disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {status.kind === "sending" ? t.sending : labels.submit}
      </button>
    </form>
  );
}
