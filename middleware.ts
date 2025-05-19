import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Return the response without modifications
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [], // Empty matcher means middleware won't run on any routes
}
