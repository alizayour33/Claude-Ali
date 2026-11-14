import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand, MachineCard } from "@/components/sections";
import { ButtonLink, Chip, Container, Eyebrow, SectionHead } from "@/components/ui";
import { getMachine, machines } from "@/lib/machines";
import { whatsappLink } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return machines.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getMachine((await params).slug);
  if (!m) return {};
  return { title: `${m.name}: ${m.tag}`, description: m.short, openGraph: { images: [m.image] } };
}

const custom = [
  ["🎨", "Exterior wrap", "Full-body graphics in your client's colors, characters and flavors."],
  ["🖥️", "Screen UI", "Logo, menu artwork and promotional content on the touchscreen."],
  ["💳", "Payments", "Card, NFC, QR and cash, matched to the local provider."],
  ["🌍", "Language", "A multilingual interface for each market."],
];

export default async function MachinePage({ params }: Props) {
  const m = getMachine((await params).slug);
  if (!m) notFound();
  const others = machines.filter((x) => x.slug !== m.slug).slice(0, 3);

  return (
    <>
      <section className="bg-[radial-gradient(700px_420px_at_20%_20%,rgba(109,58,240,.14),transparent_70%),radial-gradient(500px_360px_at_80%_90%,rgba(34,211,138,.14),transparent_70%)] py-14">
        <Container>
          <nav className="mb-8 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand">Home</Link> / <Link href="/machines" className="hover:text-brand">Machines</Link> /{" "}
            <span className="text-ink">{m.name}</span>
          </nav>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative grid min-h-[420px] place-items-center rounded-[32px] bg-white p-8 shadow-[0_30px_80px_rgba(26,11,69,.1)]">
              <span className={`absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-bold ${m.accent === "green" ? "bg-leaf text-night" : "bg-night text-white"}`}>
                {m.tag}
              </span>
              <Image src={m.image} alt={`${m.name} vending machine`} width={700} height={700} priority className="max-h-[520px] w-auto object-contain" />
            </div>
            <div>
              <Eyebrow>{m.type}</Eyebrow>
              <h1 className="text-[clamp(40px,5vw,64px)] font-extrabold leading-none">{m.name}</h1>
              <p className="mt-5 text-lg text-muted">{m.description}</p>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {m.menu.map((x) => (
                  <Chip key={x}>{x}</Chip>
                ))}
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3">
                {m.specs.slice(0, 4).map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-soft p-4">
                    <small className="text-xs font-semibold text-muted">{k}</small>
                    <b className="block text-[15px]">{v}</b>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/contact?machine=${m.slug}`} arrow>Request a Quote</ButtonLink>
                <a
                  href={whatsappLink(`Hi X&Y3, I'm interested in the ${m.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-white px-7 py-3.5 text-[15px] font-bold transition hover:border-leaf hover:text-leaf-deep"
                >
                  💬 Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHead eyebrow="Highlights" title={<>Why operators choose <span className="text-grad">{m.name}</span></>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {m.highlights.map((h) => (
              <div key={h.title} className="rounded-[20px] border border-line bg-white p-6">
                <span className="mb-4 block h-1 w-10 rounded bg-grad" />
                <h3 className="text-lg font-bold">{h.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{h.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-soft py-20">
        <Container className="grid gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <SectionHead eyebrow="Specifications" title="Technical specs" />
            <dl className="overflow-hidden rounded-2xl border border-line bg-white">
              {m.specs.map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-[1fr_1.4fr] gap-4 px-5 py-3.5 text-[15px] ${i % 2 ? "bg-soft/60" : ""}`}>
                  <dt className="font-semibold text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-muted">Specifications are supplied by the manufacturer and may vary by configuration.</p>
          </div>
          <div>
            <SectionHead eyebrow="Ideal for" title="Best locations" />
            <ul className="grid grid-cols-2 gap-3">
              {m.idealFor.map((x) => (
                <li key={x} className="rounded-2xl border border-line bg-white p-4 font-bold">
                  <span className="mr-2 text-leaf-deep">✓</span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-3xl bg-night p-7 text-white">
              <h3 className="text-xl font-bold text-white">White-label options</h3>
              <ul className="mt-4 grid gap-4">
                {custom.map(([i, t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="text-xl">{i}</span>
                    <span>
                      <b className="block">{t}</b>
                      <span className="text-sm text-white/65">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <SectionHead eyebrow="More machines" title="You might also consider" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <MachineCard key={o.slug} machine={o} />
            ))}
          </div>
        </Container>
      </section>

      <CtaBand title={`Get a quote for ${m.name}`} text="Share your venue, quantity and the client's brand. We reply with pricing and a branding mock-up." />
    </>
  );
}
