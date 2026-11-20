import Image from "next/image";
import Link from "next/link";
import { ConnectDashboard, FeatureGrid, FinalCta, GlobeGraphic, Photo, ProcessGrid, StepStrip, TagList } from "@/components/sections";
import { Arrow, ButtonLink, Container, Eyebrow, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, type PageProps } from "@/lib/page";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home({ params }: PageProps) {
  const { lang, c } = await load(params);
  const h = c.home;

  return (
    <>
      {/* 01 HERO: one focal product, one message. Picture first on phones. */}
      <section className="border-b border-line bg-ivory">
        <Container className="grid items-center gap-6 py-8 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <Eyebrow>{h.hero.eyebrow}</Eyebrow>
            <h1 className="text-[clamp(36px,6vw,76px)] font-extrabold leading-[1.02]">{h.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{h.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={href(lang, "/solutions")} arrow track="cta_explore_solutions_hero">{h.hero.cta1}</ButtonLink>
              <ButtonLink href={href(lang, "/start-a-project")} variant="outline" track="cta_start_project_hero">{h.hero.cta2}</ButtonLink>
            </div>
            <p className="mt-8 border-t border-line pt-5 text-sm font-semibold text-ink/70">{h.hero.line}</p>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-[1000/832] max-h-[260px] w-full sm:max-h-[400px] lg:max-h-none">
              <Image src="/images/slide-brand.webp" alt={h.hero.alt} fill priority sizes="(max-width: 1024px) 100vw, 600px" className="object-contain" />
            </div>
          </div>
        </Container>
      </section>

      {/* 02 BEYOND THE MACHINE */}
      <Section tone="white">
        <SectionHead eyebrow={h.beyond.eyebrow} title={h.beyond.title} text={h.beyond.text} />
        <StepStrip steps={h.beyond.strip} />
      </Section>

      {/* 03 SOLUTIONS */}
      <Section>
        <SectionHead title={h.solutions.title} />
        <ul className="grid gap-5 md:grid-cols-3">
          {h.solutions.cards.map((card, i) => (
            <li key={card.path}>
              <Link href={href(lang, card.path)} data-track={`cta_solution_card_${i + 1}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors hover:border-ink/40">
                {i === 2 ? (
                  <div className="grid aspect-[4/3] place-items-center bg-espresso">
                    <svg aria-hidden="true" viewBox="0 0 120 120" width="96" height="96" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85">
                      <path d="M30 92L48 44l34 14" /><circle cx="30" cy="92" r="6" fill="#fff" /><circle cx="48" cy="44" r="6" fill="#fff" /><circle cx="86" cy="60" r="8" fill="#C2500F" stroke="none" />
                    </svg>
                  </div>
                ) : (
                  <Photo src={card.image} alt={card.alt} pending={c.common.photoPending} className="aspect-[4/3] !rounded-none" contain={Boolean(card.image)} sizes="(max-width: 768px) 100vw, 400px" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{card.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.08em] text-flame">
                    {c.common.explore} <Arrow />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* 04 DIFFERENTIATOR */}
      <Section tone="white">
        <SectionHead title={h.differentiator.title} />
        <FeatureGrid items={h.differentiator.cards} />
        <div className="mt-10">
          <ButtonLink href={href(lang, "/services")} variant="outline" arrow track="cta_services_home">{c.nav.services}</ButtonLink>
        </div>
      </Section>

      {/* 05 X&Y3 CONNECT (dark band) */}
      <Section tone="dark">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHead light eyebrow={h.connect.eyebrow} title={h.connect.title} text={h.connect.text} />
            <TagList light items={h.connect.chips} />
            <div className="mt-9">
              <ButtonLink href={href(lang, "/connect")} arrow track="cta_discover_connect">{h.connect.cta}</ButtonLink>
            </div>
          </div>
          <ConnectDashboard c={c} />
        </div>
      </Section>

      {/* 06 LIFECYCLE */}
      <Section>
        <SectionHead title={h.lifecycle.title} />
        <ProcessGrid steps={h.lifecycle.steps} />
        <p className="mt-10 max-w-3xl font-display text-2xl font-bold leading-snug sm:text-3xl">{h.lifecycle.closing}</p>
      </Section>

      {/* 07 INTERNATIONAL */}
      <Section tone="white">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHead title={h.international.title} text={h.international.text} />
            <p className="inline-block rounded-full border border-line bg-ivory px-4 py-2 text-sm font-semibold">{h.international.note}</p>
          </div>
          <GlobeGraphic />
        </div>
      </Section>

      {/* 08 ABOUT PREVIEW */}
      <Section tone="stone">
        <div className="max-w-3xl">
          <SectionHead eyebrow={h.about.eyebrow} title={h.about.title} text={h.about.text} />
          <ButtonLink href={href(lang, "/about")} variant="dark" arrow track="cta_our_story">{h.about.cta}</ButtonLink>
        </div>
      </Section>

      {/* 09 FINAL CTA */}
      <FinalCta lang={lang} c={c} />
    </>
  );
}
