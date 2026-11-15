import { FeatureGrid, FinalCta, PageHero, Photo, ProcessGrid } from "@/components/sections";
import { ButtonLink, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.services.metaTitle, c.services.metaDesc, "/services");
}

export default async function ServicesPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const s = c.services;
  return (
    <>
      <PageHero
        eyebrow={s.hero.eyebrow}
        title={s.hero.title}
        text={s.hero.text}
        actions={<ButtonLink href={href(lang, "/start-a-project")} arrow track="cta_start_project_services">{s.hero.cta}</ButtonLink>}
        visual={<Photo src="/images/why-shipping.webp" alt="Machines being loaded for international shipment" pending={c.common.photoPending} className="aspect-[16/10] max-h-[240px] w-full sm:max-h-none" priority />}
      />
      <Section tone="white">
        <SectionHead title={s.modulesTitle} />
        <FeatureGrid items={s.modules} />
      </Section>
      <Section>
        <SectionHead title={s.process.title} />
        <ProcessGrid steps={s.process.steps} />
      </Section>
      <Section tone="stone">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{s.coverage.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{s.coverage.text}</p>
        </div>
      </Section>
      <FinalCta lang={lang} c={c} />
    </>
  );
}
