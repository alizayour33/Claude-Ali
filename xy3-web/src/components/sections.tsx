import Image from "next/image";
import Link from "next/link";
import type { Machine } from "@/lib/machines";
import { ButtonLink, Chip, Container } from "./ui";

const wraps = [1, 3, 4, 5, 6, 7, 9, 10, 11, 16];

export function WrapMarquee() {
  const items = [...wraps, ...wraps];
  return (
    <div className="overflow-hidden" aria-label="Examples of custom machine wraps">
      <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
        {items.map((n, i) => (
          <div
            key={i}
            aria-hidden={i >= wraps.length}
            className="grid h-[200px] w-[150px] flex-none place-items-center rounded-2xl bg-gradient-to-b from-white to-[#efeafb] p-2.5 sm:h-[260px] sm:w-[200px]"
          >
            <Image
              src={`/images/wrap-${n}.webp`}
              alt={i < wraps.length ? "Custom-wrapped vending machine" : ""}
              width={180}
              height={240}
              className="h-full w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MachineCard({ machine }: { machine: Machine }) {
  return (
    <Link
      href={`/machines/${machine.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white transition hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(26,11,69,.13)]"
    >
      <div className="relative grid h-80 place-items-center bg-[radial-gradient(circle_at_50%_60%,var(--color-lav),#fff_70%)] p-5">
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${machine.accent === "green" ? "bg-leaf text-night" : "bg-night text-white"}`}
        >
          {machine.tag}
        </span>
        <Image
          src={machine.image}
          alt={`${machine.name} vending machine`}
          width={400}
          height={400}
          className="max-h-full w-auto object-contain transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">{machine.name}</h3>
          <span className="text-xs font-semibold text-muted">{machine.type}</span>
        </div>
        <p className="mb-4 mt-2 flex-1 text-[15px] text-muted">{machine.short}</p>
        <div className="mb-5 flex flex-wrap gap-1.5">
          {machine.menu.slice(0, 3).map((m) => (
            <Chip key={m}>{m}</Chip>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="font-bold">Request quote</span>
          <span className="font-bold text-brand">View details →</span>
        </div>
      </div>
    </Link>
  );
}

export function CtaBand({
  title = "Talk to an X&Y3 sales manager",
  text = "Get pricing, a branding mock-up and a launch plan for your client within 24 hours.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="py-20">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[32px] bg-grad px-6 py-10 text-white sm:p-16">
          <div>
            <h2 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-white">{title}</h2>
            <p className="mt-2.5 text-white/85">{text}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="green" arrow>
              Request Quote
            </ButtonLink>
            <ButtonLink href="/machines" variant="outline-white">
              See Machines
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function CloudDashboard() {
  const bars = [35, 52, 44, 70, 62, 88, 100];
  return (
    <div className="relative rounded-3xl border border-white/10 bg-night-2 p-6 text-white">
      <div className="mb-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <i key={i} className="size-2.5 rounded-full bg-white/20" />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Today's sales", "$4,286"],
          ["Cups served", "1,142"],
          ["Online", "38/40"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-white/5 p-3.5">
            <small className="text-xs font-semibold text-white/55">{k}</small>
            <b className="block font-display text-[22px]">{v}</b>
          </div>
        ))}
      </div>
      <div className="flex h-32 items-end gap-2 rounded-2xl bg-white/[.04] p-3.5">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-b from-leaf to-brand" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-3.5 grid gap-2 text-[13px]">
        {[
          ["Mall · Level 2", "$612 today", false],
          ["Airport · Gate B", "$540 today", false],
          ["Gym · Downtown", "Restock cups", true],
        ].map(([a, b, warn]) => (
          <div key={a as string} className="flex justify-between rounded-xl bg-white/5 px-3.5 py-2.5">
            <span>
              <i className={`mr-2 inline-block size-2 rounded-full ${warn ? "bg-amber-400" : "bg-leaf"}`} />
              {a}
            </span>
            <span>{b}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/40">Illustrative dashboard, sample data.</p>
    </div>
  );
}

export function PhotoCard({
  src,
  alt,
  title,
  text,
  contain = false,
  href,
}: {
  src: string;
  alt: string;
  title: string;
  text: string;
  contain?: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <div className={`relative h-48 overflow-hidden ${contain ? "bg-white" : "bg-lav"}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`transition duration-500 group-hover:scale-105 ${contain ? "object-contain p-2" : "object-cover"}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mt-2 flex-1 text-[15px] text-muted">{text}</p>
        {href && <span className="mt-4 text-sm font-bold text-brand">Learn more →</span>}
      </div>
    </>
  );
  const cls =
    "group flex flex-col overflow-hidden rounded-[20px] border border-line bg-white transition hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_24px_50px_rgba(26,11,69,.12)]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
