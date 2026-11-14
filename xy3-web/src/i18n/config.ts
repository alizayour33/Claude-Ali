export const locales = ["en", "ar"] as const;
export type Lang = (typeof locales)[number];

export const isLang = (v: string): v is Lang => (locales as readonly string[]).includes(v);
export const isRtl = (lang: Lang) => lang === "ar";

/** Build a URL for a locale. English lives at the root, Arabic under /ar. */
export function href(lang: Lang, path: string) {
  if (lang === "en") return path;
  return path === "/" ? "/ar" : `/ar${path}`;
}

/** Strip the locale prefix from a pathname. */
export function stripLang(pathname: string) {
  // English pages are rewritten internally to /en/..., so strip both prefixes.
  for (const l of locales) {
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}
