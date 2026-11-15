import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, locales } from "@/i18n/config";

// The default language is served at the root (/services). Internally every page
// lives under app/[lang], so root URLs are rewritten to /en/... Other locales keep their prefix.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  const url = req.nextUrl.clone();

  if (first === defaultLang) {
    url.pathname = pathname.slice(defaultLang.length + 1) || "/";
    return NextResponse.redirect(url);
  }
  if ((locales as readonly string[]).includes(first)) return NextResponse.next();

  url.pathname = `/${defaultLang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|images|brand|favicon|sitemap.xml|robots.txt|.*\\..*).*)"],
};
