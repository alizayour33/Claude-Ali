import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PhotoCard } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, SectionHead } from "@/components/ui";
import { getDict, href, isLang } from "@/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "en").about;
  return { title: t.metaTitle, description: t.metaDesc, alternates: { languages: { en: "/about", ar: "/ar/about" } } };
}

const pillarImgs = ["why-factory", "why-qc", "why-shipping", "why-parts"];

export default async function AboutPage({ params }: Props) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang);
  const a = t.about;

  return (
    <>
      <section className="bg-[radial-gradient(700px_400px_at_85%_10%,rgba(109,58,240,.14),transparent_70%)] py-16">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>{a.eyebrow}</Eyebrow>
            <h1 className="text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.1]">
              {a.title} <span className="text-grad">{a.highlight}</span>
            </h1>
            <p className="mt-6 text-lg text-muted">{a.p1}</p>
            <p className="mt-4 text-lg text-muted">{a.p2}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={href(lang, "/machines")} arrow>{a.seeMachines}</ButtonLink>
              <ButtonLink href={href(lang, "/contact")} variant="ghost">{a.contactUs}</ButtonLink>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-lav to-white p-8">
            <Image src="/images/machine-family.webp" alt={t.home.platform.alt} width={2750} height={1119} priority />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {a.stats.map(([n, label], i) => (
              <div key={label} className="rounded-[20px] bg-soft px-3 py-7 text-center">
                <b dir="ltr" className={`mx-auto block w-fit font-brand text-4xl font-extrabold text-brand ${i < 3 ? "placeholder-mark" : ""}`}>{n}</b>
                <span className="text-sm font-semibold text-muted">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft py-24">
        <Container>
          <SectionHead eyebrow={a.pillarsEyebrow} title={<>{a.pillarsTitle} <span className="text-grad">{a.pillarsHighlight}</span></>} lead={a.pillarsLead} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {a.pillars.map(([title, text], i) => (
              <PhotoCard key={title} src={`/images/${pillarImgs[i]}.webp`} alt="" title={title} text={text} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative h-[380px] overflow-hidden rounded-[28px]">
            <Image src="/images/sol-dealers.webp" alt={a.teamAlt} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <SectionHead eyebrow={a.valuesEyebrow} title={a.valuesTitle} />
            <ul className="grid gap-5">
              {a.values.map(([title, d], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-10 flex-none place-items-center rounded-xl bg-grad font-brand font-extrabold text-white">{i + 1}</span>
                  <span>
                    <b className="block text-lg">{title}</b>
                    <span className="text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-night py-20 text-white">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow light>{a.certEyebrow}</Eyebrow>
            <h2 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-white">{a.certTitle}</h2>
            <p className="placeholder-mark mt-4 text-white/70">{a.certText}</p>
          </div>
          <div className="rounded-3xl bg-white p-4">
            <Image src="/images/why-cert.webp" alt={a.certAlt} width={1600} height={645} />
          </div>
        </Container>
      </section>

      <CtaBand lang={lang} t={t.cta} />
    </>
  );
}
