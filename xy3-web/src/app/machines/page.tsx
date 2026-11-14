import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, MachineCard } from "@/components/sections";
import { Container, Eyebrow, SectionHead } from "@/components/ui";
import { machines } from "@/lib/machines";

export const metadata: Metadata = {
  title: "Machines",
  description: "Floor-standing and countertop smart ice cream, frozen yogurt and açaí vending machines, all ready for white-label branding.",
};

const groups = [
  { type: "Floor-standing" as const, lead: "Full-size self-service kiosks for high-traffic venues. 32-inch screen, up to 120 cups an hour." },
  { type: "Countertop" as const, lead: "Compact automatic machines for cafés, kiosks, hotels and stores." },
];

const compare = ["Dimensions", "Weight", "Touchscreen", "Output"];

export default function MachinesPage() {
  return (
    <>
      <section className="bg-[radial-gradient(700px_400px_at_85%_0%,rgba(109,58,240,.14),transparent_70%)] pb-10 pt-16">
        <Container>
          <Eyebrow>The lineup</Eyebrow>
          <h1 className="max-w-3xl text-[clamp(38px,5vw,60px)] font-extrabold leading-[1.05]">
            Six machines. <span className="text-grad">Unlimited brands.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Every model ships unbranded and is finished in your client&apos;s wrap, screen UI and menu. Choose by venue, traffic and menu.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {groups.map((g) => (
              <a key={g.type} href={`#${g.type.toLowerCase()}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold hover:border-brand hover:text-brand">
                {g.type}
              </a>
            ))}
            <a href="#compare" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold hover:border-brand hover:text-brand">
              Compare specs
            </a>
          </div>
        </Container>
      </section>

      {groups.map((g) => (
        <section key={g.type} id={g.type.toLowerCase()} className="scroll-mt-24 py-14">
          <Container>
            <SectionHead eyebrow={g.type} title={g.type === "Countertop" ? "Countertop machines" : "Floor-standing machines"} lead={g.lead} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {machines
                .filter((m) => m.type === g.type)
                .map((m) => (
                  <MachineCard key={m.slug} machine={m} />
                ))}
            </div>
          </Container>
        </section>
      ))}

      <section id="compare" className="scroll-mt-24 bg-soft py-20">
        <Container>
          <SectionHead eyebrow="Compare" title="Specs at a glance" />
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-lav text-ink">
                <tr>
                  <th className="p-4 font-display">Model</th>
                  <th className="p-4 font-display">Type</th>
                  {compare.map((c) => (
                    <th key={c} className="p-4 font-display">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {machines.map((m) => {
                  const spec = Object.fromEntries(m.specs);
                  return (
                    <tr key={m.slug} className="border-t border-line">
                      <td className="p-4 font-bold">
                        <Link href={`/machines/${m.slug}`} className="text-brand hover:underline">{m.name}</Link>
                      </td>
                      <td className="p-4 text-muted">{m.type}</td>
                      {compare.map((c) => (
                        <td key={c} className="p-4 text-muted">{spec[c] ?? "-"}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">Specifications are supplied by the manufacturer and may vary by configuration.</p>
        </Container>
      </section>

      <CtaBand title="Not sure which machine fits?" text="Tell us about the venue and the brand, and we'll recommend a model with a quote." />
    </>
  );
}
