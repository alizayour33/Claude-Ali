import type { MetadataRoute } from "next";
import { machines } from "@/lib/machines";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/machines", "/about", "/contact", ...machines.map((m) => `/machines/${m.slug}`)];
  return pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
