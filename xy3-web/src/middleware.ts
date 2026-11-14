import { NextResponse, type NextRequest } from "next/server";

// English is served at the root (/machines), Arabic under /ar (/ar/machines).
// Internally every page lives under app/[lang], so root URLs are rewritten to /en.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url);
  }
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|images|brand|favicon|sitemap.xml|robots.txt|.*\\..*).*)"],
};
