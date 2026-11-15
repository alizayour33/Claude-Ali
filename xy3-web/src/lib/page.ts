import type { Metadata } from "next";
import { getContent } from "@/content";
import { defaultLang, isLang, type Lang } from "@/i18n/config";

export type PageProps = { params: Promise<{ lang: string }> };

/** Resolve the language and content for a page. */
export async function load(params: PageProps["params"]) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : defaultLang;
  return { lang, c: getContent(lang) };
}

/** Per-page SEO: title, description and canonical URL. */
export function seo(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: { title: `${title} · X&Y3`, description, url: path } };
}
