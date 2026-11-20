import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getContent } from "@/content";
import { isLang, isRtl, locales } from "@/i18n/config";
import { site } from "@/lib/site";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-manrope", display: "swap" });

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const c = getContent(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: c.meta.title, template: "%s · X&Y3" },
    description: c.meta.description,
    icons: { icon: "/brand/mark-axis.svg" },
    openGraph: { siteName: "X&Y3", type: "website", title: c.meta.title, description: c.meta.description, images: ["/images/slide-brand.webp"] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = getContent(lang);

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "X&Y3",
    url: site.url,
    logo: `${site.url}/brand/mark-axis.svg`,
    description: c.meta.description,
  };

  return (
    <html lang={lang} dir={isRtl(lang) ? "rtl" : "ltr"} className={`${inter.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-bold">
          {c.nav.skip}
        </a>
        <Header lang={lang} t={c.nav} />
        <main id="main">{children}</main>
        <Footer lang={lang} c={c} />
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}
