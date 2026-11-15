import { FinalCta, PageHero, Photo } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Section } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.solutions.metaTitle, c.solutions.metaDesc, "/solutions");
}

export default async function SolutionsPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const s = c.solutions;
  return (
    <>
      <PageHero
        eyebrow={s.hero.eyebrow}
        title={s.hero.title}
        text={s.hero.text}
        actions={<ButtonLink href="#frozen-dessert" arrow track="cta_find_solution">{s.hero.cta}</ButtonLink>}
      />

      {s.families.map((f, i) => (
        <section key={f.id} id={f.id} className={`scroll-mt-24 border-b border-line ${i % 2 ? "bg-ivory" : "bg-white"}`}>
          <Container className="grid items-center gap-8 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div className={i % 2 ? "lg:order-2" : ""}>
              {f.id === "emerging" ? (
                <div className="grid aspect-[4/3] place-items-center rounded-xl bg-espresso">
                  <svg aria-hidden="true" viewBox="0 0 120 120" width="120" height="120" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".85">
                    <path d="M30 92L48 44l34 14" /><circle cx="30" cy="92" r="6" fill="#fff" /><circle cx="48" cy="44" r="6" fill="#fff" /><circle cx="86" cy="60" r="8" fill="#C2500F" stroke="none" />
                  </svg>
                </div>
              ) : (
                <Photo src={f.image} alt={f.alt} pending={c.common.photoPending} contain={Boolean(f.image)} className="aspect-[4/3]" />
              )}
            </div>
            <div>
              <Eyebrow>{f.eyebrow}</Eyebrow>
              <h2 className="text-[clamp(28px,3.6vw,46px)] font-extrabold leading-[1.1]">{f.title}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">{f.text}</p>
              <div className="mt-8">
                <ButtonLink href={href(lang, f.path)} arrow variant={i === 0 ? "primary" : "dark"} track={`cta_solution_${f.id}`}>{f.cta}</ButtonLink>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <Section tone="stone">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{s.rule.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">{s.rule.text}</p>
        </div>
      </Section>

      <FinalCta lang={lang} c={c} />
    </>
  );
}
