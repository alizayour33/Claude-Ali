import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "outline-light";

const variants: Record<Variant, string> = {
  primary: "bg-flame text-white hover:bg-flame-deep",
  dark: "bg-ink text-white hover:bg-espresso-2",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
  "outline-light": "border border-white/35 text-white hover:bg-white hover:text-ink",
};

export function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

/** Uppercase CTA button. `track` names the analytics event sent on click. */
export function ButtonLink({
  variant = "primary",
  arrow = false,
  track,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: boolean; track?: string }) {
  return (
    <Link
      data-track={track}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-[13px] font-bold uppercase tracking-[.08em] transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mb-4 text-xs font-bold uppercase tracking-[.16em] ${light ? "text-[#f0a878]" : "text-flame"}`}>{children}</p>
  );
}

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  tone = "ivory",
  className = "",
  id,
  children,
}: {
  tone?: "ivory" | "white" | "stone" | "dark";
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const tones = { ivory: "bg-ivory", white: "bg-white", stone: "bg-stone", dark: "bg-espresso text-white" };
  return (
    <section id={id} className={`scroll-mt-24 py-16 sm:py-20 lg:py-28 ${tones[tone]} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  text,
  light = false,
  center = false,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  light?: boolean;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={`mb-10 max-w-3xl lg:mb-14 ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Tag className={`text-[clamp(28px,3.6vw,46px)] font-extrabold leading-[1.1] ${light ? "text-white" : ""}`}>{title}</Tag>
      {text && <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/70" : "text-muted"}`}>{text}</p>}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-xl border border-line bg-white p-6 ${className}`}>{children}</div>;
}
