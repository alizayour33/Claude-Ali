"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { track } from "@/lib/track";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * GA4 with consent. Nothing loads unless NEXT_PUBLIC_GA_ID is set and the visitor accepts.
 * Clicks on any element with a `data-track` attribute are sent as events.
 */
export function Analytics() {
  const [consent, setConsent] = useState<"yes" | "no" | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("xy3_consent");
      if (v === "yes" || v === "no") setConsent(v);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (el) track(el.dataset.track!, { path: location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID || !ready) return null;

  const choose = (v: "yes" | "no") => {
    try { localStorage.setItem("xy3_consent", v); } catch {}
    setConsent(v);
  };

  return (
    <>
      {consent === "yes" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {consent === null && (
        <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4 shadow-[0_16px_40px_rgba(28,27,25,.14)]">
          <p className="max-w-md text-sm text-muted">We use analytics cookies to understand how the site is used. You can accept or decline.</p>
          <div className="flex gap-2">
            <button onClick={() => choose("no")} className="min-h-11 rounded-lg border border-ink/25 px-4 text-sm font-bold">Decline</button>
            <button onClick={() => choose("yes")} className="min-h-11 rounded-lg bg-ink px-4 text-sm font-bold text-white">Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
