import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test the Supabase connection
    const { data, error } = await supabase.from("receipts").select("count", { count: "exact", head: true })

    if (error) {
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

    // Also try to insert a test record
    const testId = `test-${Date.now()}`
    const { error: insertError } = await supabase
      .from("receipts")
      .insert({
        id: testId,
        vendor: "Test Vendor",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        phone_number: "+1234567890",
        image_url: "https://example.com/test.jpg",
      })
      .select()

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: "Connected to Supabase but failed to insert test record",
          error: insertError.message,
        },
        { status: 500 },
      )
    }

    // Delete the test record
    await supabase.from("receipts").delete().eq("id", testId)

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Supabase and inserted test record",
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
