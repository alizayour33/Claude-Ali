import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand, PhotoCard } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, SectionHead } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: "X&Y3 is an authorized supplier of white-label smart ice cream vending machines, helping operators and brands launch self-service dessert businesses.",
};

const pillars = [
  { src: "/images/why-factory.webp", title: "Manufacturing partner", text: "Machines come from an established factory with modern production lines and fleet-scale capacity." },
  { src: "/images/why-qc.webp", title: "Tested before shipping", text: "Each unit is run-tested and inspected end to end before it leaves the line." },
  { src: "/images/why-shipping.webp", title: "Export logistics", text: "Container loading, export documents and delivery to your door or port." },
  { src: "/images/why-parts.webp", title: "Parts & service", text: "Spare parts in stock, remote diagnostics and technician training." },
];

const values = [
  ["Partner-first", "Your client's brand is the star. We stay in the background and make it work."],
  ["Honest advice", "We recommend the machine that fits the site, not the most expensive one."],
  ["Long-term support", "Selling the machine is the start. We support the fleet as it grows."],
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[radial-gradient(700px_400px_at_85%_10%,rgba(109,58,240,.14),transparent_70%)] py-16">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>About X&amp;Y3</Eyebrow>
            <h1 className="text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.05]">
              We help businesses launch <span className="text-grad">their own ice cream brand</span>.
            </h1>
            <p className="mt-6 text-lg text-muted">
              X&amp;Y3 is an authorized supplier of smart ice cream vending machines. We deliver unbranded, factory-built machines
              and customize them for our partners&apos; clients, covering the wrap, screen, menu and payments, so every machine
              launches under the client&apos;s own name.
            </p>
            <p className="mt-4 text-lg text-muted">
              Operators, distributors, venues and dessert brands use X&amp;Y3 to add self-service revenue without building
              hardware or hiring staff.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/machines" arrow>See the Machines</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">Contact Us</ButtonLink>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-lav to-white p-8">
            <Image src="/images/machine-family.webp" alt="Machines in different custom brand wraps" width={2750} height={1119} priority />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              ["00+", "Years of experience"],
              ["0,000+", "Machines supplied"],
              ["00+", "Countries"],
              ["24/7", "Remote support"],
            ].map(([n, l], i) => (
              <div key={l} className="rounded-[20px] bg-soft px-3 py-7 text-center">
                <b className={`mx-auto block w-fit font-display text-4xl font-extrabold text-brand ${i < 3 ? "placeholder-mark" : ""}`}>{n}</b>
                <span className="text-sm font-semibold text-muted">{l}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft py-24">
        <Container>
          <SectionHead
            eyebrow="What stands behind every machine"
            title={<>From factory floor <span className="text-grad">to your venue</span></>}
            lead="We combine a proven manufacturing partner with local branding, logistics and support."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <PhotoCard key={p.title} src={p.src} alt="" title={p.title} text={p.text} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative h-[380px] overflow-hidden rounded-[28px]">
            <Image src="/images/sol-dealers.webp" alt="X&Y3 team meeting with a partner" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <SectionHead eyebrow="How we work" title="Our values" />
            <ul className="grid gap-5">
              {values.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid size-10 flex-none place-items-center rounded-xl bg-grad font-display font-extrabold text-white">{i + 1}</span>
                  <span>
                    <b className="block text-lg">{t}</b>
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
            <Eyebrow light>Certifications</Eyebrow>
            <h2 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-white">Built for export markets</h2>
            <p className="placeholder-mark mt-4 text-white/70">
              Machines are supplied with documentation for CE, CB, ETL, RoHS and SGS. Confirm which certificates apply to each model.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-4">
            <Image src="/images/why-cert.webp" alt="Product certificates" width={1600} height={645} />
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
