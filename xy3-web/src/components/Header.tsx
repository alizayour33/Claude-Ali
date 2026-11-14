"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { href, stripLang, type Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { Logo } from "./Logo";
import { ButtonLink, Container } from "./ui";

export function Header({ lang, t }: { lang: Lang; t: Dict["nav"] }) {
  const pathname = usePathname();
  const path = stripLang(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const items = [
    { path: "/", label: t.home },
    { path: "/machines", label: t.machines },
    { path: "/about", label: t.about },
    { path: "/contact", label: t.contact },
  ];
  const isActive = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));
  const otherLang: Lang = lang === "ar" ? "en" : "ar";

  const switcher = (
    <Link
      href={href(otherLang, path)}
      hrefLang={otherLang}
      lang={otherLang}
      aria-label={t.switchLabel}
      className={`rounded-full border border-line px-3.5 py-2 text-sm font-bold transition hover:border-brand hover:text-brand ${otherLang === "ar" ? "font-[family-name:var(--font-plex-ar)]" : "font-[family-name:var(--font-inter)]"}`}
    >
      {t.switchTo}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <Container className="flex h-[78px] items-center justify-between gap-3">
        <Logo home={href(lang, "/")} />
        <nav className="hidden items-center gap-9 text-[15px] font-semibold md:flex" aria-label="Main">
          {items.map((item) => (
            <Link
              key={item.path}
              href={href(lang, item.path)}
              className={`relative py-1 transition hover:text-brand ${isActive(item.path) ? "text-brand after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded after:bg-leaf" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          {switcher}
          <span className="hidden lg:block">
            <ButtonLink href={href(lang, "/contact")}>{t.getQuote}</ButtonLink>
          </span>
          <button
            className="grid size-11 place-items-center rounded-xl border border-line md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.closeMenu : t.openMenu}
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </Container>
      {open && (
        <nav id="mobile-menu" className="border-t border-line bg-white md:hidden" aria-label="Mobile">
          <Container className="flex flex-col gap-1 py-4">
            {items.map((item) => (
              <Link
                key={item.path}
                href={href(lang, item.path)}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 font-semibold ${isActive(item.path) ? "bg-lav text-brand" : "hover:bg-soft"}`}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href={href(lang, "/contact")} className="mt-2 justify-center" onClick={() => setOpen(false)}>
              {t.getQuote}
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
