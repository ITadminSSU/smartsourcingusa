import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE, verifySession } from "./lib/session";
import { PORTAL_COOKIE, verifyPortalSession } from "./lib/portal-session";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area is not localized — handle auth here, skip next-intl.
  if (pathname.startsWith("/admin")) {
    const isPublic = pathname === "/admin/login" || pathname === "/admin/setup";
    if (isPublic) return NextResponse.next();

    const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Staff payroll portal — separate login/cookie, also not localized.
  if (pathname.startsWith("/portal")) {
    const isPublic = pathname === "/portal/login" || pathname === "/portal/setup";
    const session = await verifyPortalSession(
      request.cookies.get(PORTAL_COOKIE)?.value
    );

    if (isPublic) return NextResponse.next();

    if (!session) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    // Force first-login onboarding (password change) before anything else.
    if (session.mustChange && pathname !== "/portal/onboarding") {
      return NextResponse.redirect(new URL("/portal/onboarding", request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
