import { FeatureGrid, FinalCta, PageHero } from "@/components/sections";
import { ButtonLink, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.emerging.metaTitle, c.emerging.metaDesc, "/solutions/emerging");
}

export default async function EmergingPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const e = c.emerging;
  const cta = href(lang, "/start-a-project?solution=Emerging%20Robotic%20Solutions");
  return (
    <>
      <PageHero eyebrow={e.hero.eyebrow} title={e.hero.title} text={e.hero.text} actions={<ButtonLink href={cta} arrow track="cta_emerging_project">{e.hero.cta}</ButtonLink>} />
      <Section tone="white">
        <SectionHead title={e.criteria.title} />
        <FeatureGrid items={e.criteria.items} cols={4} />
      </Section>
      <FinalCta lang={lang} c={c} path="/start-a-project?solution=Emerging%20Robotic%20Solutions" title={e.invite.title} text={e.invite.text} label={e.hero.cta} track="cta_emerging_project_footer" />
    </>
  );
}
