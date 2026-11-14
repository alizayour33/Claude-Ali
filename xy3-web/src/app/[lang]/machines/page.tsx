import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, MachineCard } from "@/components/sections";
import { Container, Eyebrow, SectionHead } from "@/components/ui";
import { getDict, href, isLang } from "@/i18n";
import { getMachines, specLabels, type SpecKey } from "@/lib/machines";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "en").machinesPage;
  return { title: t.metaTitle, description: t.metaDesc, alternates: { languages: { en: "/machines", ar: "/ar/machines" } } };
}

const compare: SpecKey[] = ["dims", "weight", "screen", "output"];

export default async function MachinesPage({ params }: Props) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang);
  const p = t.machinesPage;
  const machines = getMachines(lang);
  const groups = [
    { kind: "floor" as const, id: "floor-standing", title: p.floorTitle, lead: p.floorLead },
    { kind: "counter" as const, id: "countertop", title: p.counterTitle, lead: p.counterLead },
  ];

  return (
    <>
      <section className="bg-[radial-gradient(700px_400px_at_85%_0%,rgba(109,58,240,.14),transparent_70%)] pb-10 pt-16">
        <Container>
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h1 className="max-w-3xl text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.1]">
            {p.title} <span className="text-grad">{p.highlight}</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{p.text}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold hover:border-brand hover:text-brand">
                {t.common.types[g.kind]}
              </a>
            ))}
            <a href="#compare" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold hover:border-brand hover:text-brand">
              {p.compareLink}
            </a>
          </div>
        </Container>
      </section>

      {groups.map((g) => (
        <section key={g.id} id={g.id} className="scroll-mt-24 py-14">
          <Container>
            <SectionHead eyebrow={t.common.types[g.kind]} title={g.title} lead={g.lead} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {machines
                .filter((m) => m.kind === g.kind)
                .map((m) => (
                  <MachineCard key={m.slug} machine={m} lang={lang} t={t.common} />
                ))}
            </div>
          </Container>
        </section>
      ))}

      <section id="compare" className="scroll-mt-24 bg-soft py-20">
        <Container>
          <SectionHead eyebrow={p.compareEyebrow} title={p.compareTitle} />
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-start text-sm">
              <thead className="bg-lav text-ink">
                <tr>
                  <th className="p-4 text-start font-display">{p.model}</th>
                  <th className="p-4 text-start font-display">{p.type}</th>
                  {compare.map((c) => (
                    <th key={c} className="p-4 text-start font-display">{specLabels[lang][c]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => {
                  const spec = Object.fromEntries(m.specs);
                  return (
                    <tr key={m.slug} className="border-t border-line">
                      <td className="p-4 font-bold">
                        <Link href={href(lang, `/machines/${m.slug}`)} className="font-brand text-brand hover:underline">{m.name}</Link>
                      </td>
                      <td className="p-4 text-muted">{t.common.types[m.kind]}</td>
                      {compare.map((c) => (
                        <td key={c} className="p-4 text-muted">{spec[c] ?? "-"}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">{t.common.specsNote}</p>
        </Container>
      </section>

      <CtaBand lang={lang} t={t.cta} title={p.ctaTitle} text={p.ctaText} />
    </>
  );
}
