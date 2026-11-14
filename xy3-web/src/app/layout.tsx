import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site, whatsappLink } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "X&Y3 · White-Label Smart Ice Cream Vending", template: "%s · X&Y3" },
  description: site.description,
  openGraph: { siteName: "X&Y3", type: "website", images: ["/images/hero-machines.webp"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <a
          href={whatsappLink("Hi X&Y3, I'd like to know more about your vending machines.")}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-leaf px-5 py-3.5 font-extrabold text-night shadow-[0_12px_30px_rgba(34,211,138,.45)] transition hover:-translate-y-0.5"
          aria-label="Chat with us on WhatsApp"
        >
          💬 <span className="hidden sm:inline">Chat with us</span>
        </a>
      </body>
    </html>
  );
}
