import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const error_description = requestUrl.searchParams.get("error_description")

    // Log all parameters for debugging
    console.log("Auth callback parameters:", {
      code: code ? "present" : "missing",
      error,
      error_description,
      url: request.url,
    })

    // Handle error cases
    if (error) {
      console.error("Auth error:", error, error_description)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(error_description || "")}`,
      )
    }

    // Handle code exchange
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      try {
        await supabase.auth.exchangeCodeForSession(code)
        console.log("Successfully exchanged code for session")

        // Redirect to dashboard after successful authentication
        return NextResponse.redirect(`${requestUrl.origin}/`)
      } catch (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=session_exchange_failed&error_description=${encodeURIComponent("Failed to complete authentication.")}`,
        )
      }
    }

    // Fallback for cases with no code or error
    console.warn("Auth callback called without code or error")
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=invalid_callback&error_description=${encodeURIComponent("Invalid authentication callback.")}`,
    )
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=server_error&error_description=${encodeURIComponent("An unexpected error occurred.")}`,
    )
  }
}
