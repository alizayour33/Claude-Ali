import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { Container, Eyebrow } from "@/components/ui";
import { getDict, isLang } from "@/i18n";
import { getMachine, getMachines } from "@/lib/machines";
import { site, whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ machine?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "en").contact;
  return { title: t.metaTitle, description: t.metaDesc, alternates: { languages: { en: "/contact", ar: "/ar/contact" } } };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { lang: l } = await params;
  const lang = isLang(l) ? l : "en";
  const t = getDict(lang);
  const c = t.contact;
  const { machine } = await searchParams;
  const preselect = machine && getMachine(lang, machine) ? machine : "";
  const options = getMachines(lang).map((m) => ({ slug: m.slug, name: m.name, type: t.common.types[m.kind] }));

  const channels = [
    { icon: "💬", title: c.channels.whatsapp[0], text: c.channels.whatsapp[1], href: whatsappLink(c.waMsg), value: site.phone, ltr: true },
    { icon: "✉️", title: c.channels.email[0], text: c.channels.email[1], href: `mailto:${site.email}`, value: site.email, ltr: true },
    { icon: "📍", title: c.channels.office[0], text: c.channels.office[1], href: undefined, value: site.address, ltr: false },
  ];

  return (
    <section className="bg-[radial-gradient(700px_420px_at_90%_0%,rgba(109,58,240,.14),transparent_70%),radial-gradient(500px_360px_at_0%_100%,rgba(34,211,138,.12),transparent_70%)] py-16">
      <Container className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h1 className="text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.1]">
            {c.title} <span className="text-grad">{c.highlight}</span>.
          </h1>
          <p className="mt-5 text-lg text-muted">{c.text}</p>
          <ul className="mt-9 grid gap-3.5">
            {channels.map((ch) => {
              const inner = (
                <>
                  <span className="grid size-12 flex-none place-items-center rounded-xl bg-lav text-xl">{ch.icon}</span>
                  <span>
                    <b className="block">{ch.title}</b>
                    <span className="text-sm text-muted">{ch.text}</span>
                    <span dir={ch.ltr ? "ltr" : undefined} className="placeholder-mark mt-1 block w-fit text-sm font-semibold">{ch.value}</span>
                  </span>
                </>
              );
              return (
                <li key={ch.title}>
                  {ch.href ? (
                    <a href={ch.href} target={ch.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
                      {inner}
                    </a>
                  ) : (
                    <div className="flex gap-4 rounded-2xl border border-line bg-white p-4">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-9 rounded-2xl bg-night p-6 text-white">
            <b className="font-display text-lg">{c.nextTitle}</b>
            <ol className="mt-3 grid gap-2 text-sm text-white/75">
              {c.next.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
        <QuoteForm lang={lang} t={t.form} machines={options} defaultMachine={preselect} />
      </Container>
    </section>
  );
}
