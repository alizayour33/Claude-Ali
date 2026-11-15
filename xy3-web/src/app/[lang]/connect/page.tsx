import { ConnectDashboard, FinalCta } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.connect.metaTitle, c.connect.metaDesc, "/connect");
}

export default async function ConnectPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const k = c.connect;
  return (
    <>
      <section className="bg-espresso text-white">
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:py-24">
          <div>
            <Eyebrow light>{k.hero.eyebrow}</Eyebrow>
            <h1 className="text-[clamp(32px,4.8vw,60px)] font-extrabold leading-[1.06] text-white">{k.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{k.hero.text}</p>
            <p className="mt-6 font-display text-xl font-bold text-white">{k.hero.tagline}</p>
            <p className="mt-6 inline-block rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/80">{k.status}</p>
            <div className="mt-8">
              <ButtonLink href={href(lang, "/start-a-project")} arrow track="cta_connect_talk">{k.hero.cta}</ButtonLink>
            </div>
          </div>
          <ConnectDashboard c={c} />
        </Container>
      </section>

      <Section tone="white">
        <SectionHead title={k.modulesTitle} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {k.modules.map(([title, text, badge]) => (
            <li key={title} className="rounded-xl border border-line bg-white p-6">
              <span className={`mb-4 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${badge === "integration" ? "bg-stone text-muted" : "bg-flame-soft text-flame-deep"}`}>
                {k.badges[badge]}
              </span>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="stone">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{k.architecture.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{k.architecture.text}</p>
        </div>
      </Section>

      <FinalCta lang={lang} c={c} />
    </>
  );
}
