import Link from "next/link";
import { machines } from "@/lib/machines";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Container } from "./ui";

export function Footer() {
  return (
    <footer className="bg-[#0e0628] pb-8 pt-20 text-[15px] text-white/70">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-sm">
              White-label smart ice cream vending machines and fleet software for operators, distributors and brands worldwide.
            </p>
            <div className="mt-5 flex gap-2.5">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-sm font-extrabold transition hover:bg-leaf hover:text-night"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">Machines</h4>
            <ul className="grid gap-2.5">
              {machines.map((m) => (
                <li key={m.slug}>
                  <Link href={`/machines/${m.slug}`} className="hover:text-leaf">
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">Company</h4>
            <ul className="grid gap-2.5">
              <li><Link href="/about" className="hover:text-leaf">About us</Link></li>
              <li><Link href="/machines" className="hover:text-leaf">All machines</Link></li>
              <li><Link href="/contact" className="hover:text-leaf">Request a quote</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[15px] text-white">Contact</h4>
            <ul className="grid gap-2.5">
              <li className="placeholder-mark">{site.address}</li>
              <li className="placeholder-mark">{site.phone}</li>
              <li className="placeholder-mark">{site.email}</li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[13px]">
          <span>© {new Date().getFullYear()} X&amp;Y3. All rights reserved.</span>
          <span>Privacy · Cookies · Returns</span>
        </div>
      </Container>
    </footer>
  );
}
