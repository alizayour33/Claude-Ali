import Link from "next/link";

/** Logo concept A ("Axis"): X and Y axes plus the third dimension. Swap for the final approved logo. */
export function Logo({ dark = false, home = "/" }: { dark?: boolean; home?: string }) {
  const tile = dark ? "#FAF7F2" : "#1C1B19";
  const fg = dark ? "#1C1B19" : "#FFFFFF";
  return (
    <Link href={home} className="flex items-center gap-2.5" aria-label="X&Y3 home" dir="ltr">
      <svg viewBox="0 0 64 64" width="38" height="38" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={tile} />
        <path d="M21 44V17M21 44h27" stroke={fg} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M21 44l19-19" stroke="#C2500F" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="42" cy="23" r="5.5" fill="#C2500F" />
      </svg>
      <span className={`font-display text-2xl font-extrabold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
        X&amp;Y<span className="text-flame">3</span>
      </span>
    </Link>
  );
}
