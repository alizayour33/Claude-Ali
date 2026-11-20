"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Content } from "@/content";
import { defaultLang, href, type Lang } from "@/i18n/config";
import { Logo } from "./Logo";
import { ButtonLink, Container } from "./ui";

export function Header({ lang, t }: { lang: Lang; t: Content["nav"] }) {
  const raw = usePathname();
  // English pages are rewritten internally to /en/..., so strip the prefix for matching.
  const path = raw.replace(new RegExp(`^/(${defaultLang}|${lang})(?=/|$)`), "") || "/";
  const menu = useRef<HTMLDetailsElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [raw]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { path: "/", label: t.home },
    { path: "/solutions", label: t.solutions, children: t.solutionItems },
    { path: "/services", label: t.services },
    { path: "/industries", label: t.industries },
    { path: "/connect", label: t.connect },
    { path: "/support", label: t.support },
    { path: "/about", label: t.about },
  ];
  const current = (p: string) => ((p === "/" ? path === "/" : path === p || path.startsWith(`${p}/`)) ? "page" : undefined);
  const link = "rounded px-1 py-2 text-sm font-semibold text-ink/80 transition-colors hover:text-flame aria-[current=page]:text-flame";

  return (
    <>
    <header data-compact={compact} className="group/header sticky top-0 z-50 border-b border-line bg-ivory/95 backdrop-blur">
      <Container className="flex h-[76px] items-center justify-between gap-4 transition-[height] group-data-[compact=true]/header:h-[60px]">
        <Logo home={href(lang, "/")} />

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {items.map((item) =>
            item.children ? (
              <div key={item.path} className="group/sub relative">
                <Link href={href(lang, item.path)} aria-current={current(item.path)} className={`${link} inline-flex items-center gap-1`}>
                  {item.label}
                  <svg aria-hidden="true" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 4l4 4 4-4" /></svg>
                </Link>
                <div className="invisible absolute start-1/2 top-full w-80 -translate-x-1/2 pt-3 opacity-0 transition group-focus-within/sub:visible group-focus-within/sub:opacity-100 group-hover/sub:visible group-hover/sub:opacity-100 rtl:translate-x-1/2">
                  <ul className="rounded-xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(28,27,25,.10)]">
                    {item.children.map((c) => (
                      <li key={c.path}>
                        <Link href={href(lang, c.path)} className="block rounded-lg px-4 py-3 hover:bg-stone">
                          <span className="block text-sm font-bold">{c.label}</span>
                          <span className="block text-[13px] text-muted">{c.note}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={item.path} href={href(lang, item.path)} aria-current={current(item.path)} className={link}>
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <ButtonLink href={href(lang, "/start-a-project")} track="cta_start_project_header">
              {t.cta}
            </ButtonLink>
          </span>
          <details ref={menu} className="group/menu xl:hidden">
            <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-ink/20 [&::-webkit-details-marker]:hidden" aria-label={t.menu}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path className="group-open/menu:hidden" d="M4 7h16M4 12h16M4 17h16" />
                <path className="hidden group-open/menu:block" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </summary>
            <nav className="absolute inset-x-0 top-full max-h-[calc(100dvh-60px)] overflow-y-auto border-b border-line bg-ivory" aria-label="Mobile">
              <Container className="py-4">
                <ul className="grid">
                  {items.map((item) => (
                    <li key={item.path} className="border-b border-line last:border-0">
                      <Link href={href(lang, item.path)} aria-current={current(item.path)} className="block py-3.5 font-display text-lg font-bold aria-[current=page]:text-flame">
                        {item.label}
                      </Link>
                      {item.children && (
                        <ul className="mb-3 grid gap-1 border-s-2 border-line ps-4">
                          {item.children.map((c) => (
                            <li key={c.path}>
                              <Link href={href(lang, c.path)} className="block py-2 text-[15px] font-semibold text-muted">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </Container>
            </nav>
          </details>
        </div>
      </Container>
    </header>
      {/* Phones: persistent Start a Project bar at the bottom of the screen. */}
      {path !== "/start-a-project" && (
        <div data-mobile-cta className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/95 p-3 backdrop-blur sm:hidden">
          <ButtonLink href={href(lang, "/start-a-project")} arrow track="cta_start_project_mobile_bar" className="w-full">
            {t.cta}
          </ButtonLink>
        </div>
      )}
    </>
  );
}
