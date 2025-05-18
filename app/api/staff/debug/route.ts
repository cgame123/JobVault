import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("DEBUG: Fetching all staff members directly from database")

    // Direct query to the staff table
    const { data, error } = await supabase.from("staff").select("*")

    if (error) {
      console.error("DEBUG: Error fetching staff members:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch staff members",
          details: error.message,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          // Don't include the actual key, just check if it exists
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        { status: 500 },
      )
    }

    console.log(`DEBUG: Found ${data.length} staff members in database`)

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // Don't include the actual key, just check if it exists
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error) {
    console.error("DEBUG: Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
