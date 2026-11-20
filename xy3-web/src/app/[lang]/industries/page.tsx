import { FinalCta, PageHero, Photo } from "@/components/sections";
import { ButtonLink, Section } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.industries.metaTitle, c.industries.metaDesc, "/industries");
}

export default async function IndustriesPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const i = c.industries;
  return (
    <>
      <PageHero
        eyebrow={i.hero.eyebrow}
        title={i.hero.title}
        text={i.hero.text}
        actions={<ButtonLink href={href(lang, "/start-a-project")} arrow track="cta_discuss_location_hero">{i.hero.cta}</ButtonLink>}
      />
      <Section tone="white">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {i.cards.map((card) => (
            <li key={card.title} className="overflow-hidden rounded-xl border border-line bg-white">
              <Photo src={card.image} alt={card.title} pending={c.common.photoPending} className="aspect-[16/10] !rounded-none" sizes="(max-width: 640px) 100vw, 400px" />
              <div className="p-6">
                <h2 className="text-xl font-bold">{card.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{card.text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-muted">{i.note}</p>
      </Section>
      <FinalCta lang={lang} c={c} label={i.hero.cta} track="cta_discuss_location_footer" />
    </>
  );
}
