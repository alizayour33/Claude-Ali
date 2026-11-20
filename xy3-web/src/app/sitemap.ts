import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const pages = ["", "/solutions", "/solutions/frozen-dessert", "/solutions/br3wbot", "/solutions/emerging", "/services", "/industries", "/connect", "/support", "/about", "/start-a-project", "/partner", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.7 }));
}
