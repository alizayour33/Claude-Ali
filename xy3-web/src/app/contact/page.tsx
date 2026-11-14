import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { Container, Eyebrow } from "@/components/ui";
import { getMachine } from "@/lib/machines";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Quote",
  description: "Request a quote for white-label smart ice cream vending machines. We reply within 24 hours.",
};

type Props = { searchParams: Promise<{ machine?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { machine } = await searchParams;
  const preselect = machine && getMachine(machine) ? machine : "";

  const channels = [
    { icon: "💬", title: "WhatsApp", text: "Fastest reply", href: whatsappLink("Hi X&Y3, I'd like a quote."), value: site.phone },
    { icon: "✉️", title: "Email", text: "Sales team", href: `mailto:${site.email}`, value: site.email },
    { icon: "📍", title: "Office", text: "Visits by appointment", href: undefined, value: site.address },
  ];

  return (
    <section className="bg-[radial-gradient(700px_420px_at_90%_0%,rgba(109,58,240,.14),transparent_70%),radial-gradient(500px_360px_at_0%_100%,rgba(34,211,138,.12),transparent_70%)] py-16">
      <Container className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <Eyebrow>Contact &amp; quote</Eyebrow>
          <h1 className="text-[clamp(38px,5vw,56px)] font-extrabold leading-[1.05]">
            Let&apos;s build your <span className="text-grad">client&apos;s brand</span>.
          </h1>
          <p className="mt-5 text-lg text-muted">
            Tell us about the venue, quantity and brand. Within 24 hours you&apos;ll get pricing, a recommended model and a
            branding mock-up.
          </p>
          <ul className="mt-9 grid gap-3.5">
            {channels.map((c) => {
              const inner = (
                <>
                  <span className="grid size-12 flex-none place-items-center rounded-xl bg-lav text-xl">{c.icon}</span>
                  <span>
                    <b className="block">{c.title}</b>
                    <span className="text-sm text-muted">{c.text}</span>
                    <span className="placeholder-mark mt-1 block w-fit text-sm font-semibold">{c.value}</span>
                  </span>
                </>
              );
              return (
                <li key={c.title}>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex gap-4 rounded-2xl border border-line bg-white p-4 transition hover:border-brand">
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
            <b className="font-display text-lg">What happens next?</b>
            <ol className="mt-3 grid gap-2 text-sm text-white/75">
              <li>1. A sales manager reviews your request</li>
              <li>2. We recommend a model and send a quote</li>
              <li>3. You approve a branding mock-up</li>
              <li>4. Production, shipping and launch</li>
            </ol>
          </div>
        </div>
        <QuoteForm defaultMachine={preselect} />
      </Container>
    </section>
  );
}
