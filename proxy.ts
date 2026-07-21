import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Proxy Middleware (Next.js 16 equivalent of middleware.ts)
 *
 * Strategy: Optimistic check — read session cookie without hitting the database.
 * Full session validation happens in Server Components via auth() + requireAuth().
 *
 * Reference: Next.js docs — "Optimistic checks with Proxy"
 * https://nextjs.org/docs/app/guides/authentication#optimistic-checks-with-proxy-optional
 */

// Auth.js v5 JWT session cookie names
const SESSION_COOKIE_NAMES = [
  process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
  // Also check for older cookie names for backwards compatibility
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token",
]

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name))
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoggedIn = hasSessionCookie(request)

  // Protected routes — redirect to /login if no session cookie
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth"))

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Auth pages — redirect to /dashboard if already logged in
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
