import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic, Inter, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDict, isLang, isRtl, locales } from "@/i18n";
import { site, whatsappLink } from "@/lib/site";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["600", "700", "800"], variable: "--font-cairo", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-plex-ar", display: "swap" });

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: "%s · X&Y3" },
    description: t.meta.description,
    icons: { icon: "/brand/logo-mark.svg" },
    openGraph: { siteName: "X&Y3", type: "website", locale: lang === "ar" ? "ar_AE" : "en_US", images: ["/images/hero-machines.webp"] },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const fonts = [inter, sora, cairo, plexAr].map((f) => f.variable).join(" ");

  return (
    <html lang={lang} dir={isRtl(lang) ? "rtl" : "ltr"} className={fonts}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          {t.nav.skip}
        </a>
        <Header lang={lang} t={t.nav} />
        <main id="main">{children}</main>
        <Footer lang={lang} t={t.footer} />
        <a
          href={whatsappLink(t.common.chatMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 end-5 z-50 flex items-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-extrabold text-night shadow-[0_12px_30px_rgba(34,211,138,.45)] transition hover:-translate-y-0.5"
          aria-label={t.common.chatAria}
        >
          💬 <span className="hidden sm:inline">{t.common.chat}</span>
        </a>
      </body>
    </html>
  );
}
