import Image from "next/image";
import { CloudDashboard, CtaBand, MachineCard, PhotoCard, WrapMarquee } from "@/components/sections";
import { ButtonLink, Container, Eyebrow, SectionHead } from "@/components/ui";
import { machines } from "@/lib/machines";

const solutions = [
  { src: "/images/sol-operators.webp", title: "Operators", text: "Start with one machine, prove the location, then grow your route using real sales data." },
  { src: "/images/sol-dealers.webp", title: "Dealers & Distributors", text: "Resell under your own brand, with tiered pricing, marketing kits and regional support." },
  { src: "/images/sol-venues.webp", title: "Venues & Malls", text: "Add dessert revenue in malls, cinemas, parks and transit hubs, without hiring staff." },
  { src: "/images/sol-brands.webp", title: "Dessert Brands", text: "Take your brand self-service: your recipes and your look, open 24/7 in many more places." },
];

const growth = [
  { src: "/images/step-test.webp", title: "Test the market", text: "Place a pilot unit and confirm demand, price and menu." },
  { src: "/images/step-expand.webp", title: "Expand locations", text: "Roll out to more sites, with each one picked using data from the last." },
  { src: "/images/step-brand.webp", title: "Build the brand", text: "Use a consistent wrap, UI and menu so every machine is recognizable." },
  { src: "/images/step-scale.webp", title: "Scale with data", text: "Track sales, stock and uptime across the whole fleet." },
];

const gallery = [
  { src: "/images/place-mall.webp", label: "Shopping centers", cls: "col-span-2 row-span-2" },
  { src: "/images/place-5.webp", label: "Indoor venues", cls: "row-span-2" },
  { src: "/images/place-11.webp", label: "Trade shows", cls: "" },
  { src: "/images/place-7.webp", label: "Transit hubs", cls: "" },
  { src: "/images/place-10.webp", label: "Restaurants", cls: "" },
  { src: "/images/place-park.webp", label: "Theme parks", cls: "" },
  { src: "/images/place-9.webp", label: "Workplaces", cls: "" },
  { src: "/images/place-12.webp", label: "Events", cls: "" },
];

const why = [
  { src: "/images/why-factory.webp", title: "Factory-direct supply", text: "Capacity for single units and fleet orders, at factory pricing." },
  { src: "/images/why-qc.webp", title: "Strict quality control", text: "Every machine is run-tested and inspected before shipping." },
  { src: "/images/machine-family.webp", title: "Complete white-label", text: "The client's brand goes on the wrap, the screen and the cups, with no supplier logos anywhere.", contain: true },
  { src: "/images/why-shipping.webp", title: "Global logistics", text: "Export packing, shipping documents and door-to-door delivery options." },
  { src: "/images/why-parts.webp", title: "Spare parts & support", text: "Parts kept in stock, remote diagnostics and technician training." },
  { src: "/images/why-cert.webp", title: "Certified for export", text: "Documentation for CE, CB, ETL, RoHS and SGS markets (confirm per model).", contain: true },
];

const steps = [
  ["Consult", "Tell us about the sites, the brand and your goals."],
  ["Configure", "Choose the model, wrap, menu and payments."],
  ["Approve", "Sign off the design proof and the quote."],
  ["Produce & ship", "The machines are built, tested and delivered."],
  ["Go live", "Install, train your team and start selling."],
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[radial-gradient(700px_420px_at_88%_18%,rgba(109,58,240,.16),transparent_70%),radial-gradient(520px_380px_at_70%_92%,rgba(34,211,138,.16),transparent_70%)] pb-24 pt-14">
        <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Eyebrow>White-label smart vending</Eyebrow>
            <h1 className="text-[clamp(40px,5.6vw,68px)] font-extrabold leading-[1.05]">
              Smart ice cream machines, <span className="text-grad">built for your brand.</span>
            </h1>
            <p className="mb-9 mt-6 max-w-xl text-lg text-muted">
              X&amp;Y3 supplies fully automatic soft serve, frozen yogurt and açaí vending machines. They arrive unbranded and are
              customized for your client, from the exterior wrap and screen to the menu and payments, and you run them all
              from one cloud dashboard.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <ButtonLink href="/machines" arrow>Explore Machines</ButtonLink>
              <ButtonLink href="/contact" variant="ghost">Talk to Sales</ButtonLink>
            </div>
            <div className="mt-11 flex flex-wrap gap-6 text-sm font-semibold text-muted">
              {["Factory-direct supply", "100% white-label", "Worldwide shipping"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-mint text-xs font-black text-leaf-deep">✓</span>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-[6%_4%_10%_8%] rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-grad opacity-15" />
            <Image
              src="/images/hero-machines.webp"
              alt="Two soft serve vending machines in custom brand wraps"
              width={1829}
              height={1415}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="relative w-full drop-shadow-[0_40px_50px_rgba(26,11,69,.25)]"
            />
            <div className="absolute -left-2 top-[14%] hidden items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold shadow-[0_18px_50px_rgba(26,11,69,.16)] sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-lav text-xl">🎨</span>
              <span>Your client&apos;s brand<small className="block text-xs font-semibold text-muted">Wrap · Screen · Menu</small></span>
            </div>
            <div className="absolute bottom-[8%] right-0 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold shadow-[0_18px_50px_rgba(26,11,69,.16)] sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-mint text-xl">📡</span>
              <span>Remote managed<small className="block text-xs font-semibold text-muted">Sales &amp; stock in real time</small></span>
            </div>
          </div>
        </Container>
      </section>

      {/* WRAPS */}
      <section className="overflow-hidden bg-night py-20 text-white">
        <Container className="mb-12 flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow light>One machine · endless brands</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.1] text-white">
              Same proven machine.
              <br />
              Every client&apos;s identity.
            </h2>
          </div>
          <p className="max-w-md text-lg text-white/70">
            Every unit ships unbranded and is finished in your client&apos;s colors, characters and flavors. Here are a few of the
            looks we&apos;ve delivered.
          </p>
        </Container>
        <WrapMarquee />
      </section>

      {/* PLATFORM */}
      <section className="py-24">
        <Container className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow>One platform, any brand</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.1]">
              We supply the machine. <span className="text-grad">Your client owns the brand.</span>
            </h2>
            <p className="mt-4 text-lg text-muted">Every machine is configured before it ships, so it arrives ready to sell under your client&apos;s name.</p>
            <ol className="my-8 grid gap-5">
              {[
                ["Choose a model", "Floor-standing or countertop, matched to the site's traffic, space and menu."],
                ["Apply the brand", "Exterior wrap, touchscreen UI, menu and cups in the client's identity, with no supplier logos."],
                ["Set up payments", "Card, NFC, QR wallets, coins and notes, configured per market and language."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3.5">
                  <span className="grid size-8 flex-none place-items-center rounded-[10px] bg-brand font-display font-extrabold text-white">{i + 1}</span>
                  <div>
                    <b className="block">{t}</b>
                    <span className="text-[15px] text-muted">{d}</span>
                  </div>
                </li>
              ))}
            </ol>
            <ButtonLink href="/contact" arrow>Start a Custom Build</ButtonLink>
          </div>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-lav to-white p-8">
            <span className="absolute left-5 top-5 rounded-full bg-leaf px-3 py-1.5 text-xs font-extrabold text-night">Fully customizable</span>
            <Image src="/images/machine-family.webp" alt="A lineup of machines in different custom brand wraps" width={2750} height={1119} sizes="(max-width:1024px) 100vw, 560px" />
          </div>
        </Container>
      </section>

      {/* PROMO */}
      <section>
        <Container>
          <div className="grid items-center overflow-hidden rounded-[32px] bg-grad text-white lg:grid-cols-[1.1fr_.9fr]">
            <div className="p-8 sm:p-14">
              <span className="mb-4 inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[.12em] text-[#c9f7e2]">
                <span className="size-2 rounded-full bg-white" /> Trending menu
              </span>
              <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.1] text-white">Açaí &amp; frozen yogurt, served automatically.</h2>
              <p className="mb-8 mt-4 max-w-lg text-white/85">
                A healthy-dessert menu for gyms, campuses, offices and wellness venues. Customers build their own bowl, the
                machine serves it in seconds, and nobody needs to staff the counter.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/machines/xy-bowl" variant="green" arrow>See XY-Bowl</ButtonLink>
                <ButtonLink href="/contact?machine=xy-bowl" variant="outline-white">Request Quote</ButtonLink>
              </div>
            </div>
            <div className="grid h-full place-items-center bg-white/95 p-5">
              <Image src="/images/acai-promo.webp" alt="Customers using açaí vending machines" width={1672} height={941} sizes="(max-width:1024px) 100vw, 500px" />
            </div>
          </div>
        </Container>
      </section>

      {/* STATS */}
      <section className="py-24">
        <Container>
          <SectionHead center eyebrow="Proven at scale" title={<>Built for real <span className="text-grad">commercial use</span></>} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              ["00+", "Years in vending", true],
              ["0,000+", "Machines running", true],
              ["00+", "Countries served", true],
              ["120", "Cups / hour per unit", false],
              ["24/7", "Remote monitoring", false],
            ].map(([n, l, ph]) => (
              <div key={l as string} className="rounded-[20px] bg-soft px-3 py-7 text-center">
                <b className={`block font-display text-4xl font-extrabold tracking-tight text-brand ${ph ? "placeholder-mark mx-auto w-fit" : ""}`}>{n}</b>
                <span className="text-sm font-semibold text-muted">{l}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* SOLUTIONS */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead
            eyebrow="Business solutions"
            title={<>A program for <span className="text-grad">every partner</span></>}
            lead="Whether you're placing your first machine or rolling out a national network, there's a path that fits."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((s) => (
              <PhotoCard key={s.title} src={s.src} alt="" title={s.title} text={s.text} href="/contact" />
            ))}
          </div>
        </Container>
      </section>

      {/* GROWTH */}
      <section className="py-24">
        <Container>
          <SectionHead center eyebrow="Growth path" title={<>From one machine to <span className="text-grad">a network</span></>} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {growth.map((g, i) => (
              <div key={g.title}>
                <div className="relative mb-5 h-52 overflow-hidden rounded-[18px]">
                  <Image src={g.src} alt="" fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover" />
                  <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl bg-white font-display font-extrabold text-brand shadow">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-bold">{g.title}</h3>
                <p className="mt-1.5 text-[15px] text-muted">{g.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/contact" arrow>Find My Business Solution</ButtonLink>
          </div>
        </Container>
      </section>

      {/* GALLERY */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead eyebrow="In the field" title={<>Wherever people <span className="text-grad">stop and smile</span></>} />
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3.5 sm:auto-rows-[220px] lg:grid-cols-4">
            {gallery.map((g) => (
              <div key={g.src} className={`relative overflow-hidden rounded-[18px] ${g.cls}`}>
                <Image src={g.src} alt={g.label} fill sizes="(max-width:1024px) 50vw, 25vw" className="object-cover" />
                <span className="absolute bottom-3.5 left-3.5 rounded-full bg-white/90 px-3 py-1.5 text-[13px] font-bold">{g.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* MACHINES */}
      <section className="py-24">
        <Container>
          <SectionHead
            eyebrow="The lineup"
            title={<>Explore all <span className="text-grad">machine styles</span></>}
            lead="Every model ships unbranded and ready for your client's wrap. Pricing depends on configuration and volume."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {machines.map((m) => (
              <MachineCard key={m.slug} machine={m} />
            ))}
          </div>
        </Container>
      </section>

      {/* WHY */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead center eyebrow="Why X&Y3" title={<>Everything you need to <span className="text-grad">launch &amp; scale</span></>} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((w) => (
              <PhotoCard key={w.title} src={w.src} alt="" title={w.title} text={w.text} contain={w.contain} />
            ))}
          </div>
        </Container>
      </section>

      {/* SOFTWARE */}
      <section className="relative overflow-hidden bg-night py-24 text-white">
        <div className="pointer-events-none absolute -right-48 -top-48 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(34,211,138,.25),transparent_65%)]" />
        <Container className="relative grid items-center gap-16 lg:grid-cols-2">
          <div>
            <Eyebrow light>X&amp;Y3 Cloud</Eyebrow>
            <h2 className="text-[clamp(30px,3.6vw,44px)] font-extrabold leading-[1.1] text-white">Run the whole fleet with remote management</h2>
            <p className="mt-4 text-lg text-white/70">See every machine&apos;s status, sales and stock in real time, on your phone or desktop.</p>
            <div className="my-9 grid gap-6 sm:grid-cols-2">
              {[
                ["📡 Live status", "Temperature, uptime and faults for every unit."],
                ["📈 Sales reports", "Revenue by machine, location, product and hour."],
                ["🔔 Stock alerts", "Restock reminders before a machine runs out."],
                ["🧩 Remote control", "Change prices, menus and promos from anywhere."],
              ].map(([t, d]) => (
                <div key={t}>
                  <b className="mb-1 block">{t}</b>
                  <span className="text-sm text-white/65">{d}</span>
                </div>
              ))}
            </div>
            <ButtonLink href="/contact" variant="green" arrow>Book a Demo</ButtonLink>
          </div>
          <CloudDashboard />
        </Container>
      </section>

      {/* STEPS */}
      <section className="bg-soft py-24">
        <Container>
          <SectionHead center eyebrow="Getting started" title={<>Launch in <span className="text-grad">five steps</span></>} />
          <ol className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {steps.map(([t, d], i) => (
              <li key={t} className="rounded-[20px] border border-line bg-white p-6">
                <span className="text-grad mb-2.5 block font-display text-4xl font-extrabold">0{i + 1}</span>
                <h3 className="text-lg font-bold">{t}</h3>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
