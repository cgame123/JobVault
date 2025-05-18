import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Create the staff table
    const { error: staffError } = await supabaseAdmin.rpc("create_staff_table", {})

    if (staffError && !staffError.message.includes("already exists")) {
      throw staffError
    }

    // Create the receipts table
    const { error: receiptsError } = await supabaseAdmin.rpc("create_receipts_table", {})

    if (receiptsError && !receiptsError.message.includes("already exists")) {
      throw receiptsError
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
