import Link from "next/link";
import type { Content } from "@/content";
import { href, type Lang } from "@/i18n/config";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Container } from "./ui";

export function Footer({ lang, c }: { lang: Lang; c: Content }) {
  const { nav, footer } = c;
  const cols = [
    {
      title: nav.solutions,
      links: nav.solutionItems.map((s) => ({ label: s.label, path: s.path })),
    },
    {
      title: footer.explore,
      links: [
        { label: nav.services, path: "/services" },
        { label: nav.industries, path: "/industries" },
        { label: nav.connect, path: "/connect" },
        { label: nav.support, path: "/support" },
      ],
    },
    {
      title: footer.company,
      links: [
        { label: nav.about, path: "/about" },
        { label: footer.partner, path: "/partner" },
        { label: footer.contact, path: "/contact" },
        { label: nav.cta, path: "/start-a-project" },
      ],
    },
  ];
  return (
    <footer className="bg-espresso text-white/70">
      <Container className="pb-28 pt-16 sm:pb-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo dark home={href(lang, "/")} />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed">{footer.line}</p>
            {site.social.length > 0 && (
              <ul className="mt-5 flex gap-4 text-sm">
                {site.social.map((s) => (
                  <li key={s.label}><a href={s.href} className="hover:text-white">{s.label}</a></li>
                ))}
              </ul>
            )}
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[.14em] text-white">{col.title}</h2>
              <ul className="grid gap-2.5 text-[15px]">
                {col.links.map((l) => (
                  <li key={l.path}><Link href={href(lang, l.path)} className="hover:text-white">{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 max-w-3xl text-[13px] leading-relaxed text-white/50">{footer.note}</p>
        <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[13px]">
          <span>© {new Date().getFullYear()} X&amp;Y3. {footer.rights}</span>
          <span className="flex gap-5">
            <Link href={href(lang, "/privacy")} className="hover:text-white">{footer.privacy}</Link>
            <Link href={href(lang, "/terms")} className="hover:text-white">{footer.terms}</Link>
          </span>
        </div>
      </Container>
    </footer>
  );
}
