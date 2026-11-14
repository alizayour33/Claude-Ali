export const site = {
  name: "X&Y3",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://xy3.vercel.app",
  // TODO: replace placeholders with real contact details
  email: "sales@yourdomain.com",
  phone: "+00 000 000 0000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "000000000000",
  address: "Your business address, City, Country",
  social: [
    { label: "Instagram", short: "IG", href: "#" },
    { label: "Facebook", short: "f", href: "#" },
    { label: "X", short: "X", href: "#" },
    { label: "YouTube", short: "▶", href: "#" },
  ],
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
