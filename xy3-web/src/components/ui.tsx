import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "green" | "ghost" | "outline-white";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-[0_10px_24px_rgba(109,58,240,.28)] hover:bg-brand-deep",
  green: "bg-leaf text-night hover:bg-[#3be39c]",
  ghost: "border-2 border-line bg-white text-ink hover:border-brand hover:text-brand",
  "outline-white": "border-2 border-white/50 text-white hover:bg-white hover:text-night",
};

/** A direction-aware arrow: points right in LTR, left in RTL. */
export function Arrow() {
  return (
    <span aria-hidden="true" className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
      →
    </span>
  );
}

export function ButtonLink({
  variant = "primary",
  arrow = false,
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: boolean }) {
  return (
    <Link
      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold transition hover:-translate-y-0.5 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={`mb-4 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.12em] rtl:text-sm rtl:tracking-normal ${light ? "text-[#9ff0cb]" : "text-brand"}`}
    >
      <span className="size-2 rounded-full bg-leaf" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`mb-14 ${center ? "text-center" : ""}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2 className={`text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.15] ${light ? "text-white" : ""}`}>{title}</h2>
      {lead && (
        <p className={`mt-4 max-w-2xl text-lg ${center ? "mx-auto" : ""} ${light ? "text-white/70" : "text-muted"}`}>{lead}</p>
      )}
    </div>
  );
}

/** "Plain title <gradient>highlight</gradient>" helper. */
export function Hl({ title, highlight }: { title: string; highlight: string }) {
  return (
    <>
      {title} <span className="text-grad">{highlight}</span>
    </>
  );
}

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto max-w-[1200px] px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-lav px-3 py-1 text-xs font-bold text-brand-deep">{children}</span>;
}
