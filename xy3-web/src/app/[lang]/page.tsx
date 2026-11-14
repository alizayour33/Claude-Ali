import type { Metadata } from "next";
import Image from "next/image";
import { HeroSlider } from "@/components/HeroSlider";
import { CloudDashboard, CtaBand, MachineCard, PhotoCard, WrapMarquee } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, Hl, SectionHead } from "@/components/ui";
import { getDict, href, isLang } from "@/i18n";
import { getMachines } from "@/lib/machines";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: { languages: { en: "/", ar: "/ar" } }, title: isLang(lang) ? { absolute: getDict(lang).meta.title } : undefined };
}

const solutionImgs = ["sol-operators", "sol-dealers", "sol-venues", "sol-brands"];
const growthImgs = ["step-test", "step-expand", "step-brand", "step-scale"];
const galleryImgs = [
  ["place-mall", "col-span-2 row-span-2"],
  ["place-5", "row-span-2"],
  ["place-11", ""],
  ["place-7", ""],
  ["place-10", ""],
  ["place-park", ""],
  ["place-9", ""],
  ["place-12", ""],
];
const whyImgs: [string, boolean][] = [
  ["why-factory", false],
  ["why-qc", false],
  ["machine-family", true],
  ["why-shipping", false],
  ["why-parts", false],
  ["why-cert", true],
];

export default async function Home({ params }: Props) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang);
  const h = t.home;

  return (
    <>
      <HeroSlider lang={lang} t={t.hero} />

      {/* WRAPS */}
      <section className="overflow-hidden bg-night py-20 text-white">
        <Container className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow light>{h.wraps.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.15] text-white">
              {h.wraps.title1}
              <br />
              {h.wraps.title2}
            </h2>
          </div>
          <p className="max-w-md text-lg text-white/70">{h.wraps.text}</p>
        </Container>
        <WrapMarquee alt={h.wraps.alt} aria={h.wraps.aria} />
      </section>

      {/* PLATFORM */}
      <section className="py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow>{h.platform.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.15]">
              <Hl title={h.platform.title} highlight={h.platform.highlight} />
            </h2>
            <p className="mt-4 text-lg text-muted">{h.platform.text}</p>
            <ol className="my-8 grid gap-5">
              {h.platform.steps.map(([title, d], i) => (
                <li key={title} className="flex gap-3.5">
                  <span className="grid size-8 flex-none place-items-center rounded-[10px] bg-brand font-brand font-extrabold text-white">{i + 1}</span>
                  <div>
                    <b className="block">{title}</b>
                    <span className="text-[15px] text-muted">{d}</span>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href={href(lang, "/contact")} arrow>{h.platform.cta}</ButtonLink>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-lav to-white p-8">
            <span className="absolute start-5 top-5 rounded-full bg-leaf px-3 py-1.5 text-xs font-extrabold text-night">{h.platform.pill}</span>
            <Image src="/images/machine-family.webp" alt={h.platform.alt} width={2750} height={1119} sizes="(max-width:1024px) 100vw, 560px" />
          </div>
        </Container>
      </section>

      {/* PROMO */}
      <section>
        <Container>
          <div className="grid items-center overflow-hidden rounded-[32px] bg-grad text-white lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 sm:p-14">
              <span className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.12em] text-[#c9f7e2] rtl:text-sm rtl:tracking-normal">
                <span className="size-2 rounded-full bg-white" /> {h.promo.eyebrow}
              </span>
              <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.15] text-white">{h.promo.title}</h2>
              <p className="mb-8 mt-4 max-w-lg text-white/85">{h.promo.text}</p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={href(lang, "/machines/xy-bowl")} variant="green" arrow>{h.promo.primary}</ButtonLink>
                <ButtonLink href={href(lang, "/contact?machine=xy-bowl")} variant="outline-white">{h.promo.secondary}</ButtonLink>
              </div>
            </div>
            <div className="grid h-full place-items-center bg-white/95 p-5">
              <Image src="/images/acai-promo.webp" alt={h.promo.alt} width={1672} height={941} sizes="(max-width:1024px) 100vw, 500px" />
            </div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section className="py-24">
        <Container>
          <SectionHead center eyebrow={h.stats.eyebrow} title={<Hl title={h.stats.title} highlight={h.stats.highlight} />} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {h.stats.items.map(([n, label, ph]) => (
              <div key={label} className="rounded-[20px] bg-soft px-3 py-7 text-center">
                <b dir="ltr" className={`block font-brand text-4xl font-extrabold tracking-tight text-brand ${ph ? "placeholder-mark mx-auto w-fit" : ""}`}>{n}</b>
                <span className="text-sm font-semibold text-muted">{label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SOLUTIONS */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead eyebrow={h.solutions.eyebrow} title={<Hl title={h.solutions.title} highlight={h.solutions.highlight} />} lead={h.solutions.lead} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {h.solutions.items.map(([title, text], i) => (
              <PhotoCard key={title} src={`/images/${solutionImgs[i]}.webp`} alt="" title={title} text={text} href={href(lang, "/contact")} more={t.common.learnMore} />
            ))}
          </div>
        </Container>
      </section>

      {/* GROWTH */}
      <section className="py-24">
        <Container>
          <SectionHead center eyebrow={h.growth.eyebrow} title={<Hl title={h.growth.title} highlight={h.growth.highlight} />} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {h.growth.items.map(([title, text], i) => (
              <div key={title}>
                <div className="relative mb-5 h-52 overflow-hidden rounded-[18px]">
                  <Image src={`/images/${growthImgs[i]}.webp`} alt="" fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover" />
                  <span className="absolute start-3 top-3 grid size-10 place-items-center rounded-xl bg-white font-brand font-extrabold text-brand shadow">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href={href(lang, "/contact")} arrow>{h.growth.cta}</ButtonLink>
          </div>
        </Container>
      </section>

      {/* GALLERY */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead eyebrow={h.gallery.eyebrow} title={<Hl title={h.gallery.title} highlight={h.gallery.highlight} />} />
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3.5 sm:auto-rows-[220px] lg:grid-cols-4">
            {galleryImgs.map(([img, cls], i) => (
              <div key={img} className={`relative overflow-hidden rounded-[18px] ${cls}`}>
                <Image src={`/images/${img}.webp`} alt={h.gallery.labels[i]} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                <span className="absolute bottom-3.5 start-3.5 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-bold">{h.gallery.labels[i]}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* MACHINES */}
      <section className="py-24">
        <Container>
          <SectionHead eyebrow={h.lineup.eyebrow} title={<Hl title={h.lineup.title} highlight={h.lineup.highlight} />} lead={h.lineup.lead} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getMachines(lang).map((m) => (
              <MachineCard key={m.slug} machine={m} lang={lang} t={t.common} />
            ))}
          </div>
        </Container>
      </section>

      {/* WHY */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead center eyebrow={h.why.eyebrow} title={<Hl title={h.why.title} highlight={h.why.highlight} />} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {h.why.items.map(([title, text], i) => (
              <PhotoCard key={title} src={`/images/${whyImgs[i][0]}.webp`} alt="" title={title} text={text} contain={whyImgs[i][1]} />
            ))}
          </div>
        </Container>
      </section>

      {/* SOFTWARE */}
      <section className="relative overflow-hidden bg-night py-24 text-white">
        <div className="pointer-events-none absolute -end-48 -top-48 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(34,211,138,.25),transparent_65%)]" />
        <Container className="relative grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow light>{h.software.eyebrow}</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.15] text-white">{h.software.title}</h2>
            <p className="mt-4 text-lg text-white/70">{h.software.text}</p>
            <div className="my-9 grid gap-6 sm:grid-cols-2">
              {h.software.items.map(([title, d]) => (
                <div key={title}>
                  <b className="mb-1 block">{title}</b>
                  <span className="text-sm text-white/65">{d}</span>
                </div>
              ))}
            </div>
            <ButtonLink href={href(lang, "/contact")} variant="green" arrow>{h.software.cta}</ButtonLink>
          </div>
          <CloudDashboard t={t.dashboard} />
        </Container>
      </section>

      {/* STEPS */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead center eyebrow={h.steps.eyebrow} title={<Hl title={h.steps.title} highlight={h.steps.highlight} />} />
          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {h.steps.items.map(([title, d], i) => (
              <li key={title} className="rounded-[20px] border border-line bg-white p-6">
                <span className="text-grad mb-2.5 block font-brand text-4xl font-extrabold">0{i + 1}</span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <CtaBand lang={lang} t={t.cta} />
    </>
  );
}
