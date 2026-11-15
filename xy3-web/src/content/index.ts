import type { Lang } from "@/i18n/config";
import en, { type Content } from "./en";

// Register translated content here, e.g. { en, ar }.
const all: Record<Lang, Content> = { en };

export const getContent = (lang: Lang): Content => all[lang];
export type { Content };
