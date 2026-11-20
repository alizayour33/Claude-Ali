import Link from "next/link";
import { PageHero } from "@/components/sections";
import { LeadForm, type Field } from "@/components/LeadForm";
import { Container, Section, SectionHead } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.support.metaTitle, c.support.metaDesc, "/support");
}

const icons: Record<string, string> = {
  wrench: "M14.5 5.5a4 4 0 00-5.2 5.2L4 16l2 2 5.3-5.3a4 4 0 005.2-5.2L14 10l-2-2 2.5-2.5z",
  box: "M3.5 7L10 3.5 16.5 7v6.5L10 17l-6.5-3.5V7zM3.5 7L10 10.5 16.5 7M10 10.5V17",
  alert: "M10 3.5l7.5 13h-15L10 3.5zM10 8.5v4M10 14.7v.1",
  doc: "M6 3h6l3.5 3.5V17H6V3zM12 3v4h3.5M8.5 10.5h4M8.5 13.5h4",
  cap: "M2.5 8L10 4.5 17.5 8 10 11.5 2.5 8zM5.5 9.5v4c1.2 1.2 2.8 1.8 4.5 1.8s3.3-.6 4.5-1.8v-4",
};

export default async function SupportPage({ params, searchParams }: PageProps & { searchParams: Promise<{ category?: string }> }) {
  const { lang, c } = await load(params);
  const s = c.support;
  const f = c.form.support;
  const { category } = await searchParams;
  const preset = category && f.options.category.includes(category) ? category : "";

  const fields: Field[] = [
    { name: "company", label: f.fields.company, required: true, autoComplete: "organization" },
    { name: "name", label: f.fields.name, required: true, autoComplete: "name" },
    { name: "email", label: f.fields.email, type: "email", required: true, autoComplete: "email" },
    { name: "phone", label: f.fields.phone, type: "tel", autoComplete: "tel" },
    { name: "country", label: f.fields.country, required: true, autoComplete: "country-name" },
    { name: "site", label: f.fields.site },
    { name: "product", label: f.fields.product, type: "select", options: f.options.product, required: true },
    { name: "model", label: f.fields.model },
    { name: "serial", label: f.fields.serial },
    { name: "category", label: f.fields.category, type: "select", options: f.options.category, required: true },
    { name: "urgency", label: f.fields.urgency, type: "select", options: f.options.urgency, required: true },
    { name: "contactMethod", label: f.fields.contactMethod, type: "select", options: f.options.contactMethod },
    { name: "description", label: f.fields.description, type: "textarea", required: true },
    { name: "files", label: f.fields.files, type: "file" },
  ];

  return (
    <>
      <PageHero eyebrow={s.hero.eyebrow} title={s.hero.title} text={s.hero.text} />

      <section className="border-b border-line bg-white">
        <Container className="py-8">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {s.actions.map((a) => (
              <li key={a.label}>
                <Link
                  href={`${href(lang, "/support")}?category=${encodeURIComponent(a.category)}#request`}
                  data-track={`cta_support_${a.icon}`}
                  data-set={`support-category:${a.category}`}
                  className="flex min-h-11 h-full items-center gap-3 rounded-xl border border-line p-4 text-sm font-bold uppercase tracking-[.06em] transition-colors hover:border-flame hover:text-flame"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-flame"><path d={icons[a.icon]} /></svg>
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Section id="request">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <SectionHead title={s.formTitle} text={s.formText} />
          </div>
          <LeadForm
            key={preset}
            kind="support"
            fields={fields}
            t={c.form}
            defaults={{ category: preset }}
            showReference
            labels={{ submit: f.submit, okTitle: f.okTitle, okText: f.okText, reference: f.reference }}
          />
        </div>
      </Section>

      <Section tone="stone">
        <SectionHead title={s.knowledge.title} text={s.knowledge.text} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {s.knowledge.items.map((k) => (
            <li key={k} className="rounded-xl border border-line bg-white p-5">
              <h3 className="text-base font-bold">{k}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-muted">{s.knowledge.soon}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
