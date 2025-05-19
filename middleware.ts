import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client for the middleware
  const supabase = createMiddlewareClient({ req, res })

  // Refresh the session if it exists
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Log the session status for debugging
  console.log("Middleware session check:", session ? "Authenticated" : "Not authenticated")

  const isAuthRoute = req.nextUrl.pathname === "/login"
  const isProtectedRoute = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/staff")

  // If user is signed in and trying to access login page, redirect to dashboard
  if (session && isAuthRoute) {
    console.log("Redirecting authenticated user from login to dashboard")
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If user is not signed in and trying to access protected route, redirect to login
  if (!session && isProtectedRoute) {
    console.log("Redirecting unauthenticated user to login")
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes should be processed by the middleware
export const config = {
  matcher: ["/", "/login", "/staff/:path*"],
}
