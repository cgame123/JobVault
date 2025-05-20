import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get parameters from the query string
    const type = request.nextUrl.searchParams.get("type") || "receipt"
    const vendor = request.nextUrl.searchParams.get("vendor") || "Unknown Vendor"
    const color = request.nextUrl.searchParams.get("color") || "#4B5563" // Default gray-600
    const bgColor = request.nextUrl.searchParams.get("bgColor") || "#1F2937" // Default gray-800

    // Create a simple SVG placeholder based on the type
    let svg = ""

    if (type === "receipt") {
      // Receipt icon with vendor name
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <g transform="translate(4, 4)" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 18V2c0-1.1-.9-2-2-2H2C.9 0 0 .9 0 2v16l3-2 2 2 2-2 2 2 2-2 2 2 3-2z"/>
          <path d="M4 5h8M4 9h8M4 13h8"/>
        </g>
        <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="2" fill="${color}" text-anchor="middle">
          ${vendor}
        </text>
      </svg>`
    } else {
      // Generic image placeholder
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <g transform="translate(4, 4)" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="0" y="0" width="16" height="16" rx="2"/>
          <circle cx="5" cy="5" r="1.5"/>
          <path d="M16 12l-4-4-8 8"/>
        </g>
        <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="2" fill="${color}" text-anchor="middle">
          No Image
        </text>
      </svg>`
    }

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error generating placeholder SVG:", error)

    // Return a simple fallback SVG
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
      <rect width="100%" height="100%" fill="#1F2937"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="3" fill="#6B7280" text-anchor="middle">
        No Image
      </text>
    </svg>`

    return new NextResponse(fallbackSvg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
      },
    })
  }
}
