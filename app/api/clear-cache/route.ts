import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function GET() {
  try {
    console.log("🔄 Refreshing schema cache...")

    // Force a refresh of the schema cache by updating a comment on the table
    const refreshCache = await supabaseAdmin.rpc("exec", {
      query:
        "COMMENT ON TABLE receipts IS 'Table for storing receipt information, updated with status and paid columns'",
    })

    if (refreshCache.error) {
      console.error("❌ Error refreshing schema cache:", refreshCache.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to refresh schema cache",
          details: refreshCache.error.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Schema cache refreshed successfully")
    return NextResponse.json({
      success: true,
      message: "Schema cache refreshed successfully. Please refresh the page to see the changes.",
    })
  } catch (error) {
    console.error("❌ Error refreshing schema cache:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh schema cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
