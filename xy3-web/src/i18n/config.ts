// Launch is English only. To add Arabic later: add "ar" here, add src/content/ar.ts,
// and register it in src/content/index.ts. Routing, RTL and fonts hooks are already in place.
export const locales = ["en"] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = "en";

export const isLang = (v: string): v is Lang => (locales as readonly string[]).includes(v);
export const isRtl = (lang: string) => lang === "ar";

/** Build a URL for a locale. The default locale lives at the root. */
export function href(lang: Lang, path: string) {
  if (lang === defaultLang) return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}
