import Image from "next/image";
import { Attribution, FeatureGrid, FinalCta, PageHero, Photo, ProcessGrid, TagList } from "@/components/sections";
import { ButtonLink, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.frozen.metaTitle, c.frozen.metaDesc, "/solutions/frozen-dessert");
}

export default async function FrozenDessertPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const f = c.frozen;
  const quote = href(lang, "/start-a-project?solution=Frozen%20Dessert%20Robotics");
  return (
    <>
      <PageHero
        eyebrow={f.hero.eyebrow}
        title={f.hero.title}
        text={f.hero.text}
        actions={<ButtonLink href={quote} arrow track="cta_frozen_project_hero">{f.hero.cta}</ButtonLink>}
        visual={
          <div>
            <div className="relative mx-auto aspect-[1000/832] max-h-[260px] w-full sm:max-h-[400px] lg:max-h-none">
              <Image src="/images/slide-brand.webp" alt={f.hero.alt} fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-contain" />
            </div>
          </div>
        }
      />

      <Section tone="white">
        <SectionHead title={f.intro.title} text={f.intro.text} />
        <ProcessGrid steps={f.intro.points} />
        <Attribution text={c.common.attribution} />
      </Section>

      <Section>
        <SectionHead title={f.platform.title} text={f.platform.text} />
        <FeatureGrid items={f.platform.items} cols={4} />
      </Section>

      <Section tone="white">
        <SectionHead title={f.gallery.title} text={f.gallery.text} />
        <ul className="grid gap-5 md:grid-cols-3">
          {f.gallery.items.map((g) => (
            <li key={g.label}>
              <Photo src={g.image} alt={g.alt} pending={c.common.photoPending} contain={Boolean(g.image)} className="aspect-[4/3] border border-line bg-ivory" sizes="(max-width: 768px) 100vw, 400px" />
              <p className="mt-3 font-display text-lg font-bold">{g.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="dark">
        <SectionHead light title={f.support.title} text={f.support.text} />
        <TagList light items={f.support.items} />
        <div className="mt-9">
          <ButtonLink href={href(lang, "/services")} variant="outline-light" arrow track="cta_services_frozen">{c.nav.services}</ButtonLink>
        </div>
      </Section>

      <Section>
        <SectionHead title={f.applications.title} text={f.applications.text} />
        <TagList items={f.applications.items} />
        <p className="mt-8 max-w-2xl text-sm text-muted">{f.specs}</p>
      </Section>

      <FinalCta lang={lang} c={c} path="/start-a-project?solution=Frozen%20Dessert%20Robotics" title={f.cta.title} text={f.cta.text} label={f.cta.label} track="cta_frozen_project_footer" />
    </>
  );
}
