"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { Logo } from "./Logo";
import { ButtonLink, Container } from "./ui";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur-md">
      <Container className="flex h-[78px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-9 text-[15px] font-semibold md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-1 transition hover:text-brand ${isActive(item.href) ? "text-brand after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded after:bg-leaf" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="/contact" className="hidden sm:inline-flex">
            Get a Quote
          </ButtonLink>
          <button
            className="grid size-11 place-items-center rounded-xl border border-line md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </Container>
      {open && (
        <nav id="mobile-menu" className="border-t border-line bg-white md:hidden" aria-label="Mobile">
          <Container className="flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 font-semibold ${isActive(item.href) ? "bg-lav text-brand" : "hover:bg-soft"}`}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/contact" className="mt-2 justify-center" onClick={() => setOpen(false)}>
              Get a Quote
            </ButtonLink>
          </Container>
        </nav>
      )}
    </header>
  );
}
