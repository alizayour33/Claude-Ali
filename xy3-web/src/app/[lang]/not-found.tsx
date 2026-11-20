import { ButtonLink, Container, Eyebrow } from "@/components/ui";
import { getContent } from "@/content";
import { defaultLang, href } from "@/i18n/config";

export default function NotFound() {
  const lang = defaultLang;
  const t = getContent(lang).notFound;
  return (
    <section className="py-24 lg:py-36">
      <Container>
        <Eyebrow>404</Eyebrow>
        <h1 className="text-[clamp(32px,4.8vw,56px)] font-extrabold">{t.title}</h1>
        <p className="mt-4 text-lg text-muted">{t.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={href(lang, "/")}>{t.home}</ButtonLink>
          <ButtonLink href={href(lang, "/solutions")} variant="outline">{t.solutions}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
