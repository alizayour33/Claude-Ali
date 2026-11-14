"use client";

import { usePathname } from "next/navigation";
import { ButtonLink, Container } from "@/components/ui";
import { getDict, href } from "@/i18n";

export default function NotFound() {
  const lang = usePathname().startsWith("/ar") ? "ar" : "en";
  const t = getDict(lang).notFound;
  return (
    <section className="py-32 text-center">
      <Container>
        <p className="text-grad font-brand text-8xl font-extrabold">404</p>
        <h1 className="mt-4 text-3xl font-extrabold">{t.title}</h1>
        <p className="mt-3 text-muted">{t.text}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href={href(lang, "/")}>{t.home}</ButtonLink>
          <ButtonLink href={href(lang, "/machines")} variant="ghost">{t.machines}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
