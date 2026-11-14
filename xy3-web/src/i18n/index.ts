import type { Lang } from "./config";
import ar from "./ar";
import en, { type Dict } from "./en";

const dicts: Record<Lang, Dict> = { en, ar };

export const getDict = (lang: Lang): Dict => dicts[lang];
export type { Dict };
export * from "./config";
