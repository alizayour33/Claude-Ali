import { FeatureGrid, FinalCta, PageHero } from "@/components/sections";
import { Container, Eyebrow, Section, SectionHead } from "@/components/ui";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.about.metaTitle, c.about.metaDesc, "/about");
}

export default async function AboutPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const a = c.about;
  return (
    <>
      <PageHero eyebrow={a.hero.eyebrow} title={a.hero.title} />

      <Section tone="white">
        <div className="grid max-w-4xl gap-6 text-xl leading-relaxed text-ink/85">
          {a.story.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
      </Section>

      <section className="bg-espresso text-white">
        <Container className="py-20 lg:py-28">
          <p className="max-w-5xl font-display text-[clamp(32px,5.4vw,72px)] font-extrabold leading-[1.04]">{a.statement}</p>
        </Container>
      </section>

      <Section>
        <SectionHead title={a.pillarsTitle} />
        <FeatureGrid items={a.pillars} cols={4} />
      </Section>

      <Section tone="stone">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>{a.name.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(28px,3.6vw,46px)] font-extrabold leading-[1.1]">{a.name.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">{a.name.text}</p>
          </div>
          <ul className="flex flex-wrap items-center gap-3 font-display text-xl font-extrabold sm:text-2xl">
            {a.name.parts.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="rounded-xl border border-ink/15 bg-white px-5 py-4">{p}</span>
                {i < a.name.parts.length - 1 && <span aria-hidden="true" className="text-flame">+</span>}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta lang={lang} c={c} />
    </>
  );
}
