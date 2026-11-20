import { PageHero } from "@/components/sections";
import { LeadForm, type Field } from "@/components/LeadForm";
import { ButtonLink, Section } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.project.metaTitle, c.project.metaDesc, "/start-a-project");
}

export default async function StartProjectPage({ params, searchParams }: PageProps & { searchParams: Promise<{ solution?: string }> }) {
  const { lang, c } = await load(params);
  const p = c.project;
  const f = c.form.project;
  const { solution } = await searchParams;
  const preset = solution && f.options.solution.includes(solution) ? solution : "";

  const fields: Field[] = [
    { name: "intent", label: p.intentLabel, type: "chips", options: p.intents, required: true },
    { name: "name", label: f.fields.name, required: true, autoComplete: "name" },
    { name: "company", label: f.fields.company, required: true, autoComplete: "organization" },
    { name: "country", label: f.fields.country, required: true, autoComplete: "country-name" },
    { name: "email", label: f.fields.email, type: "email", required: true, autoComplete: "email" },
    { name: "phone", label: f.fields.phone, type: "tel", autoComplete: "tel" },
    { name: "industry", label: f.fields.industry, type: "select", options: f.options.industry },
    { name: "solution", label: f.fields.solution, type: "select", options: f.options.solution },
    { name: "machines", label: f.fields.machines, type: "select", options: f.options.machines },
    { name: "stage", label: f.fields.stage, type: "select", options: f.options.stage },
    { name: "timeline", label: f.fields.timeline, type: "select", options: f.options.timeline },
    { name: "description", label: f.fields.description, type: "textarea", required: true },
    { name: "files", label: f.fields.files, type: "file" },
  ];

  return (
    <>
      <PageHero eyebrow={p.hero.eyebrow} title={p.hero.title} text={p.hero.text} />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr]">
          <LeadForm key={preset} kind="project" fields={fields} t={c.form} defaults={{ solution: preset }} labels={{ submit: f.submit, okTitle: f.okTitle, okText: f.okText }} />
          <aside className="grid content-start gap-5">
            <div className="rounded-xl border border-line bg-white p-6">
              <h2 className="text-lg font-bold">{p.aside.title}</h2>
              <ol className="mt-4 grid gap-3 text-[15px] text-muted">
                {p.aside.steps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="font-display font-extrabold text-flame">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl bg-espresso p-6 text-white">
              <h2 className="text-lg font-bold text-white">{p.aside.supportTitle}</h2>
              <p className="mt-2 text-[15px] text-white/70">{p.aside.supportText}</p>
              <div className="mt-5">
                <ButtonLink href={href(lang, "/support")} variant="outline-light" track="cta_support_from_project">{p.aside.supportCta}</ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
