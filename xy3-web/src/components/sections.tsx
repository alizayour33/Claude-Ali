import Image from "next/image";
import type { ReactNode } from "react";
import type { Content } from "@/content";
import { href, type Lang } from "@/i18n/config";
import { ButtonLink, Container, Eyebrow } from "./ui";

/** Marked frame for a photo the client still has to supply. Never shown as if it were a real image. */
export function Placeholder({ label, note, className = "", dark = false }: { label: string; note: string; className?: string; dark?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`${label} (${note})`}
      className={`grid place-items-center rounded-xl border border-dashed p-6 text-center ${dark ? "border-white/25 bg-white/5 text-white/70" : "border-ink/25 bg-stone text-muted"} ${className}`}
    >
      <div>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-60">
          <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17l5-4 3 2.5 4-4 4 4" />
        </svg>
        <p className="text-sm font-bold">{label}</p>
        <p className="mt-1 text-xs uppercase tracking-[.12em]">{note}</p>
      </div>
    </div>
  );
}

/** Product or scene photo, or a marked placeholder when `src` is empty. */
export function Photo({
  src,
  alt,
  pending,
  className = "",
  contain = false,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 600px",
  dark = false,
}: {
  src: string;
  alt: string;
  pending: string;
  className?: string;
  contain?: boolean;
  priority?: boolean;
  sizes?: string;
  dark?: boolean;
}) {
  if (!src) return <Placeholder label={alt} note={pending} className={className} dark={dark} />;
  return (
    <div className={`relative overflow-hidden rounded-xl ${contain ? "" : "bg-stone"} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={contain ? "object-contain" : "object-cover"} />
    </div>
  );
}

/** Standard inner-page hero: text on one side, one focal visual on the other. Picture first on phones. */
export function PageHero({
  eyebrow,
  title,
  text,
  actions,
  visual,
  tone = "ivory",
}: {
  eyebrow: string;
  title: string;
  text?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  tone?: "ivory" | "stone";
}) {
  return (
    <section className={`${tone === "stone" ? "bg-stone" : "bg-ivory"} border-b border-line`}>
      <Container className={`grid items-center gap-8 py-10 sm:py-14 lg:gap-14 lg:py-20 ${visual ? "lg:grid-cols-[1.05fr_.95fr]" : ""}`}>
        <div className={visual ? "order-2 lg:order-1" : "max-w-3xl"}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-[clamp(32px,4.8vw,60px)] font-extrabold leading-[1.06]">{title}</h1>
          {text && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{text}</p>}
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {visual && <div className="order-1 lg:order-2">{visual}</div>}
      </Container>
    </section>
  );
}

/** A sequence of named steps joined by arrows (wraps on small screens). */
export function StepStrip({ steps, light = false }: { steps: string[]; light?: boolean }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span className={`rounded-full border px-4 py-2 text-sm font-bold ${light ? "border-white/25 text-white" : "border-ink/20 bg-white text-ink"}`}>{s}</span>
          {i < steps.length - 1 && (
            <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-flame rtl:-scale-x-100"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Numbered process steps with a short description each. */
export function ProcessGrid({ steps }: { steps: string[][] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {steps.map(([title, text], i) => (
        <li key={title} className="bg-white p-6">
          <span className="font-display text-sm font-extrabold text-flame">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="mt-2 text-lg font-bold">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Grid of title + text cards with a small accent rule. */
export function FeatureGrid({ items, cols = 3 }: { items: string[][]; cols?: 2 | 3 | 4 }) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <ul className={`grid gap-4 ${grid}`}>
      {items.map(([title, text]) => (
        <li key={title} className="rounded-xl border border-line bg-white p-6">
          <span aria-hidden="true" className="mb-4 block h-0.5 w-8 bg-flame" />
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
        </li>
      ))}
    </ul>
  );
}

export function TagList({ items, light = false }: { items: string[]; light?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((x) => (
        <li key={x} className={`rounded-full border px-4 py-2 text-sm font-semibold ${light ? "border-white/20 bg-white/5 text-white" : "border-line bg-white text-ink"}`}>{x}</li>
      ))}
    </ul>
  );
}

/** Manufacturer attribution line required by the spec. */
export function Attribution({ text }: { text: string }) {
  return (
    <p className="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-muted">
      <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" className="mt-0.5 flex-none"><circle cx="10" cy="10" r="7.5" /><path d="M10 9v5M10 6.2v.1" strokeLinecap="round" /></svg>
      {text}
    </p>
  );
}

/** Dark closing call to action used at the bottom of most pages. */
export function FinalCta({ lang, c, title, text, label, path = "/start-a-project", track = "cta_start_project_footer" }: { lang: Lang; c: Content; title?: string; text?: string; label?: string; path?: string; track?: string }) {
  const f = c.finalCta;
  return (
    <section className="bg-espresso text-white">
      <Container className="py-20 lg:py-28">
        <div className="max-w-3xl">
          <Eyebrow light>{f.eyebrow}</Eyebrow>
          <h2 className="text-[clamp(32px,4.6vw,58px)] font-extrabold leading-[1.06] text-white">{title ?? f.title}</h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">{text ?? f.text}</p>
          <div className="mt-9">
            <ButtonLink href={href(lang, path)} arrow track={track}>
              {label ?? f.cta}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

const statusTone = ["bg-emerald-400", "bg-amber-400", "bg-red-400"];

/** Illustrative X&Y3 Connect dashboard (concept UI, sample data). */
export function ConnectDashboard({ c }: { c: Content }) {
  const d = c.connect.dashboard;
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-espresso-2 text-white shadow-[0_30px_80px_rgba(0,0,0,.35)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="font-display text-sm font-extrabold">X&amp;Y3 Connect</span>
          <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/60">{d.sample}</span>
        </div>
        <div className="grid sm:grid-cols-[150px_1fr]">
          <ul className="hidden gap-0.5 border-e border-white/10 p-3 text-[13px] sm:grid">
            {d.nav.map((n, i) => (
              <li key={n} className={`rounded-md px-3 py-1.5 ${i === 0 ? "bg-white/10 font-bold text-white" : "text-white/55"}`}>{n}</li>
            ))}
          </ul>
          <div className="grid gap-3 p-4">
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">{d.fleet}</p>
              <ul className="grid grid-cols-3 gap-3">
                {d.statuses.map(([label, n], i) => (
                  <li key={label}>
                    <span className="font-display text-2xl font-extrabold tabular-nums">{n}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12px] leading-tight text-white/65">
                      <i className={`size-2 flex-none rounded-full ${statusTone[i]}`} />
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="grid grid-cols-3 gap-3">
              {d.cards.map(([label, n]) => (
                <li key={label} className="rounded-lg bg-white/5 p-3">
                  <span className="font-display text-xl font-extrabold tabular-nums">{n}</span>
                  <span className="mt-0.5 block text-[12px] leading-tight text-white/60">{label}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-lg bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">{d.activityTitle}</p>
              <ul className="grid gap-2 text-[13px]">
                {d.activity.map(([a, b]) => (
                  <li key={a} className="flex flex-wrap justify-between gap-x-3"><span>{a}</span><span className="text-white/50">{b}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[13px] text-white/50">{c.common.conceptPreview}</figcaption>
    </figure>
  );
}

/** Abstract globe graphic. Deliberately shows no countries or markets (none are verified yet). */
export function GlobeGraphic() {
  return (
    <svg viewBox="0 0 400 400" role="img" aria-label="Abstract globe" className="mx-auto w-full max-w-[380px] text-ink/25">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="200" cy="200" r="170" />
        <ellipse cx="200" cy="200" rx="115" ry="170" />
        <ellipse cx="200" cy="200" rx="55" ry="170" />
        <path d="M200 30v340M30 200h340" />
        <ellipse cx="200" cy="200" rx="170" ry="60" />
        <ellipse cx="200" cy="200" rx="170" ry="120" />
      </g>
      <path d="M92 250C150 120 250 110 318 168" fill="none" stroke="#C2500F" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="2 9" />
      <circle cx="92" cy="250" r="7" fill="#C2500F" />
      <circle cx="318" cy="168" r="7" fill="#1C1B19" />
    </svg>
  );
}
