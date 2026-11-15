import { PageHero } from "@/components/sections";
import { ButtonLink, Section } from "@/components/ui";
import { href } from "@/i18n/config";
import { load, seo, type PageProps } from "@/lib/page";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps) {
  const { c } = await load(params);
  return seo(c.contact.metaTitle, c.contact.metaDesc, "/contact");
}

export default async function ContactPage({ params }: PageProps) {
  const { lang, c } = await load(params);
  const k = c.contact;
  return (
    <>
      <PageHero eyebrow={k.hero.eyebrow} title={k.hero.title} text={k.hero.text} />
      <Section tone="white">
        <ul className="grid gap-5 sm:grid-cols-2">
          {k.cards.map((card) => {
            const email = site.emails[card.emailKey as keyof typeof site.emails];
            return (
              <li key={card.title} className="flex flex-col rounded-xl border border-line p-7">
                <h2 className="text-2xl font-extrabold">{card.title}</h2>
                <p className="mt-2 flex-1 text-lg text-muted">{card.text}</p>
                {site.emailsLive && <p className="mt-4 select-all font-semibold" dir="ltr">{email}</p>}
                {card.cta && (
                  <div className="mt-6">
                    <ButtonLink href={href(lang, card.path)} variant="dark" arrow track={`cta_contact_${card.emailKey}`}>{card.cta}</ButtonLink>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!site.emailsLive && <p className="mt-8 text-sm text-muted">{k.emailNote}</p>}
      </Section>
    </>
  );
}
