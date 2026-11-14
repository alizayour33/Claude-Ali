import Link from "next/link";
import { href, type Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { getMachines } from "@/lib/machines";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Container } from "./ui";

export function Footer({ lang, t }: { lang: Lang; t: Dict["footer"] }) {
  return (
    <footer className="bg-[#0e0628] pb-8 pt-20 text-[15px] text-white/70">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          <div>
            <Logo dark home={href(lang, "/")} />
            <p className="mt-4 max-w-sm">{t.blurb}</p>
            <div className="mt-5 flex gap-2.5">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-sm font-extrabold transition hover:bg-leaf hover:text-night"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">{t.machines}</h4>
            <ul className="grid gap-2.5">
              {getMachines(lang).map((m) => (
                <li key={m.slug}>
                  <Link href={href(lang, `/machines/${m.slug}`)} className="hover:text-leaf">
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">{t.company}</h4>
            <ul className="grid gap-2.5">
              <li><Link href={href(lang, "/about")} className="hover:text-leaf">{t.aboutUs}</Link></li>
              <li><Link href={href(lang, "/machines")} className="hover:text-leaf">{t.allMachines}</Link></li>
              <li><Link href={href(lang, "/contact")} className="hover:text-leaf">{t.requestQuote}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">{t.contact}</h4>
            <ul className="grid gap-2.5">
              <li className="placeholder-mark">{site.address}</li>
              <li className="placeholder-mark" dir="ltr">{site.phone}</li>
              <li className="placeholder-mark" dir="ltr">{site.email}</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[13px]">
          <span>© {new Date().getFullYear()} X&amp;Y3. {t.rights}</span>
          <span>{t.legal}</span>
        </div>
      </Container>
    </footer>
  );
}
