import { Attribution, FeatureGrid, FinalCta, PageHero, Photo, StepStrip, TagList } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.br3wbot.metaTitle, c.br3wbot.metaDesc, "/solutions/br3wbot");
}

export default async function Br3wBotPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const b = c.br3wbot;
  const info = href(lang, "/start-a-project?solution=Br3wBot%20Coffee%20Robotics");
  return (
    <>
      <PageHero
        tone="stone"
        eyebrow={b.hero.eyebrow}
        title={b.hero.title}
        text={b.hero.text}
        actions={
          <>
            <ButtonLink href="#robotic-barista" arrow track="cta_discover_br3wbot">{b.hero.cta1}</ButtonLink>
            <ButtonLink href={info} variant="outline" track="cta_br3wbot_info_hero">{b.hero.cta2}</ButtonLink>
          </>
        }
        visual={<Photo src="" alt={b.hero.alt} pending={c.common.photoPending} className="aspect-[4/3] max-h-[260px] w-full sm:max-h-none" />}
      />

      <Section tone="white">
        <FeatureGrid items={b.band} cols={4} />
        <p className="mt-5 text-[13px] text-muted">{b.bandNote}</p>
      </Section>

      <section id="robotic-barista" className="scroll-mt-24 bg-ivory">
        <Container className="grid items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <Photo src="" alt="Br3wBot robotic arm preparing coffee" pending={c.common.photoPending} className="aspect-[4/3]" />
          <div>
            <Eyebrow>{b.barista.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(28px,3.6vw,46px)] font-extrabold leading-[1.1]">{b.barista.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{b.barista.text}</p>
            <Attribution text={c.common.attributionBr3wbot} />
          </div>
        </Container>
      </section>

      <Section tone="dark">
        <div className="max-w-4xl">
          <h2 className="text-[clamp(30px,4.4vw,56px)] font-extrabold leading-[1.08] text-white">{b.dark.title}</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{b.dark.text}</p>
        </div>
      </Section>

      <Section tone="white">
        <SectionHead title={b.flow.title} />
        <StepStrip steps={b.flow.steps} />
      </Section>

      <Section>
        <SectionHead title={b.applications.title} text={b.applications.text} />
        <TagList items={b.applications.items} />
      </Section>

      <Section tone="stone">
        <SectionHead title={b.support.title} />
        <TagList items={b.support.items} />
        <p className="mt-10 max-w-3xl font-display text-2xl font-bold leading-snug sm:text-3xl">{b.closing}</p>
      </Section>

      <FinalCta lang={lang} c={c} path="/start-a-project?solution=Br3wBot%20Coffee%20Robotics" title={b.cta.title} text={b.cta.text} label={b.cta.label} track="cta_br3wbot_info_footer" />
    </>
  );
}
