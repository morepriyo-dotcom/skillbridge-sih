import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PORTAL_PREFIXES = [
  "/dashboard", "/skills", "/opportunities", "/applications", "/portfolio",
  "/internship-log", "/mentorship", "/collaborations", "/recruiter",
  "/institution", "/admin", "/profile",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPortalRoute = PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Quick check: if on a public route and no Supabase cookies exist, bypass middleware entirely
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  if (!isPortalRoute && !isAuthRoute && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  const { user, response } = await updateSession(request);

  if (!user && isPortalRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js)$).*)",
  ],
};
