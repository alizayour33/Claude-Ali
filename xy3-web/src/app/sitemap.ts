import type { MetadataRoute } from "next";
import { machineSlugs } from "@/lib/machines";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/machines", "/about", "/contact", ...machineSlugs.map((s) => `/machines/${s}`)];
  return pages.flatMap((p) => {
    const en = `${site.url}${p === "/" ? "" : p}`;
    const ar = `${site.url}/ar${p === "/" ? "" : p}`;
    const alternates = { languages: { en, ar } };
    return [
      { url: en, changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7, alternates },
      { url: ar, changeFrequency: "monthly" as const, priority: p === "/" ? 0.9 : 0.6, alternates },
    ];
  });
}
