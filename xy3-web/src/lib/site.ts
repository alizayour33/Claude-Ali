export const site = {
  name: "X&Y3",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://xy3.vercel.app",
  // Planned addresses from the spec. Shown only when NEXT_PUBLIC_EMAILS_LIVE=true (after domain email is set up).
  emails: { info: "info@xandy3.com", sales: "sales@xandy3.com", support: "support@xandy3.com" },
  emailsLive: process.env.NEXT_PUBLIC_EMAILS_LIVE === "true",
  // Add verified social profiles here; the footer shows them only when present.
  social: [] as { label: string; href: string }[],
};
