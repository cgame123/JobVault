import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test the Supabase connection
    const { data, error } = await supabase.from("receipts").select("*").limit(1)

    if (error) {
      // If the error is about the table not existing, that's expected before initialization
      if (error.message.includes("does not exist")) {
        return NextResponse.json({
          success: true,
          message: "Connected to Supabase, but tables need to be created",
          hint: "Visit /api/init-db to create tables",
        })
      }

      console.error("Supabase connection error:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Supabase",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase",
      data,
    })
  } catch (error) {
    console.error("Error testing Supabase connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing Supabase connection",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
