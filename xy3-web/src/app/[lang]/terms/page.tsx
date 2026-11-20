import { PageHero } from "@/components/sections";
import { Section } from "@/components/ui";
import { load, seo, type PageProps } from "@/lib/page";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return { ...seo(c.legal.terms, c.legal.pending, "/terms"), robots: { index: false } };
}

export default async function LegalPage({ params }: PageProps) {
  const { c } = await load(params);
  return (
    <>
      <PageHero eyebrow="X&Y3" title={c.legal.terms} />
      <Section tone="white">
        <p className="max-w-2xl text-lg text-muted">{c.legal.pending}</p>
      </Section>
    </>
  );
}
