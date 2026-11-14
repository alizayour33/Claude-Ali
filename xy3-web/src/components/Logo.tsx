import Image from "next/image";
import Link from "next/link";

export function Logo({ dark = false, home = "/" }: { dark?: boolean; home?: string }) {
  return (
    <Link href={home} className="flex items-center gap-2.5" aria-label="X&Y3" dir="ltr">
      <Image src="/brand/logo-mark.svg" alt="" width={40} height={40} priority />
      <span className={`font-brand text-[25px] font-extrabold tracking-[-.04em] ${dark ? "text-white" : "text-ink"}`}>
        X&amp;Y<span className="text-leaf">3</span>
      </span>
    </Link>
  );
}
