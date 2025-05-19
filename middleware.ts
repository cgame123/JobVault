import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/login" ||
    path === "/demo-login" ||
    path === "/auth/callback" ||
    path.startsWith("/auth-debug") ||
    path.startsWith("/api/")

  // Check if user is authenticated via demo login
  const isDemoAuthenticated = request.cookies.get("demo-auth")?.value === "true"

  // If the path is not public and user is not authenticated, redirect to login
  if (!isPublicPath && !isDemoAuthenticated) {
    return NextResponse.redirect(new URL("/demo-login", request.url))
  }

  // If the path is login and user is authenticated, redirect to dashboard
  if (path === "/login" && isDemoAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
