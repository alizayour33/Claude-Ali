"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { href, type Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import { ButtonLink, Container, Eyebrow } from "./ui";

const INTERVAL = 6000;
const tints = [
  "radial-gradient(700px 420px at 85% 20%,rgba(109,58,240,.18),transparent 70%),radial-gradient(520px 380px at 70% 92%,rgba(34,211,138,.16),transparent 70%)",
  "radial-gradient(700px 420px at 80% 30%,rgba(34,211,138,.18),transparent 70%),radial-gradient(520px 380px at 20% 90%,rgba(109,58,240,.12),transparent 70%)",
  "radial-gradient(700px 420px at 85% 25%,rgba(90,20,90,.18),transparent 70%),radial-gradient(520px 380px at 60% 95%,rgba(109,58,240,.14),transparent 70%)",
];

export function HeroSlider({ lang, t }: { lang: Lang; t: Dict["hero"] }) {
  const slides = t.slides;
  const n = slides.length;
  const rtl = lang === "ar";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % n) + n) % n), [n]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(next, INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, next]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;
    if (Math.abs(dx) < 50) return;
    // Swiping toward the "start" side shows the next slide.
    const forward = rtl ? dx > 0 : dx < 0;
    if (forward) next();
    else prev();
  };

  return (
    <section
      className="relative overflow-hidden transition-[background] duration-700"
      style={{ background: tints[index % tints.length] }}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") (rtl ? prev : next)();
        if (e.key === "ArrowLeft") (rtl ? next : prev)();
      }}
      data-hero
    >
      <div
        className="flex touch-pan-y transition-transform duration-700 ease-[cubic-bezier(.22,.8,.2,1)] motion-reduce:transition-none"
        style={{ transform: `translateX(${(rtl ? 1 : -1) * index * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        data-track
      >
        {slides.map((s, i) => {
          const active = i === index;
          const Heading = i === 0 ? "h1" : "h2";
          return (
            <div
              key={i}
              className="w-full shrink-0"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${n}`}
              aria-hidden={!active}
              inert={!active}
              data-slide
            >
              <Container className="grid min-h-[620px] items-center gap-10 pb-24 pt-12 lg:grid-cols-[1.05fr_.95fr]">
                <div className={`transition duration-700 ${active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`} data-slide-text>
                  <Eyebrow>{s.eyebrow}</Eyebrow>
                  <Heading className="text-[clamp(38px,5.4vw,66px)] font-extrabold leading-[1.08]">
                    {s.title} <span className="text-grad">{s.highlight}</span>
                  </Heading>
                  <p className="mb-9 mt-6 max-w-xl text-lg text-muted">{s.text}</p>
                  <div className="flex flex-wrap gap-3.5">
                    <ButtonLink href={href(lang, s.primary[1])} arrow>
                      {s.primary[0]}
                    </ButtonLink>
                    <ButtonLink href={href(lang, s.secondary[1])} variant="ghost">
                      {s.secondary[0]}
                    </ButtonLink>
                  </div>
                  {i === 0 && (
                    <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-muted">
                      {t.badges.map((b) => (
                        <span key={b} className="flex items-center gap-2">
                          <span className="grid size-5 place-items-center rounded-full bg-mint text-xs font-black text-leaf-deep">✓</span>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-[6%_4%_10%_8%] rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-grad opacity-15" />
                  <Image
                    src={s.image}
                    alt={s.alt}
                    width={1600}
                    height={1200}
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 560px"
                    draggable={false}
                    className={`relative max-h-[480px] w-full object-contain drop-shadow-[0_40px_50px_rgba(26,11,69,.25)] transition duration-1000 ${active ? "scale-100" : "scale-95"}`}
                  />
                  {i === 0 && (
                    <>
                      <div className="absolute -start-2 top-[12%] hidden items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold shadow-[0_18px_50px_rgba(26,11,69,.16)] sm:flex">
                        <span className="grid size-10 place-items-center rounded-xl bg-lav text-xl">🎨</span>
                        <span>
                          {t.float1[0]}
                          <small className="block text-xs font-semibold text-muted">{t.float1[1]}</small>
                        </span>
                      </div>
                      <div className="absolute bottom-[6%] end-0 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-bold shadow-[0_18px_50px_rgba(26,11,69,.16)] sm:flex">
                        <span className="grid size-10 place-items-center rounded-xl bg-mint text-xl">📡</span>
                        <span>
                          {t.float2[0]}
                          <small className="block text-xs font-semibold text-muted">{t.float2[1]}</small>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Container>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-7 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          aria-label={t.prev}
          data-prev
          className="grid size-10 place-items-center rounded-full border border-line bg-white/80 text-lg font-bold backdrop-blur transition hover:border-brand hover:text-brand"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`${t.goTo} ${i + 1}`}
              aria-current={i === index}
              data-dot
              className={`h-2.5 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-brand" : "w-2.5 bg-brand/25 hover:bg-brand/50"}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label={t.next}
          data-next
          className="grid size-10 place-items-center rounded-full border border-line bg-white/80 text-lg font-bold backdrop-blur transition hover:border-brand hover:text-brand"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:-scale-x-100"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </section>
  );
}
