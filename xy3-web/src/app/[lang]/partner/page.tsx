import { PageHero } from "@/components/sections";
import { LeadForm, type Field } from "@/components/LeadForm";
import { ButtonLink, Section, SectionHead } from "@/components/ui";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.partner.metaTitle, c.partner.metaDesc, "/partner");
}

export default async function PartnerPage({ params }: PageProps) {
  const { c } = await load(params);
  const p = c.partner;
  const f = c.form.partner;
  const fields: Field[] = [
    { name: "company", label: f.fields.company, required: true, autoComplete: "organization" },
    { name: "country", label: f.fields.country, required: true, autoComplete: "country-name" },
    { name: "website", label: f.fields.website, autoComplete: "url" },
    { name: "name", label: f.fields.name, required: true, autoComplete: "name" },
    { name: "email", label: f.fields.email, type: "email", required: true, autoComplete: "email" },
    { name: "partnerType", label: f.fields.partnerType, type: "select", options: f.options.partnerType, required: true },
    { name: "industries", label: f.fields.industries },
    { name: "coverage", label: f.fields.coverage },
    { name: "teamSize", label: f.fields.teamSize, type: "select", options: f.options.teamSize },
    { name: "brands", label: f.fields.brands },
    { name: "capability", label: f.fields.capability, full: true },
    { name: "message", label: f.fields.message, type: "textarea", required: true },
  ];
  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} text={p.hero.text} actions={<ButtonLink href="#inquiry" arrow track="cta_partner_inquiry">{p.formTitle}</ButtonLink>} />
      <Section tone="white">
        <ul className="grid gap-5 md:grid-cols-2">
          {p.types.map((t) => (
            <li key={t.title} className="rounded-xl border border-line p-7">
              <span aria-hidden="true" className="mb-4 block h-0.5 w-8 bg-flame" />
              <h2 className="text-2xl font-extrabold">{t.title}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{t.text}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section id="inquiry">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHead title={p.formTitle} text={p.formText} />
          <LeadForm kind="partner" fields={fields} t={c.form} labels={{ submit: f.submit, okTitle: f.okTitle, okText: f.okText }} />
        </div>
      </Section>
    </>
  );
}
