import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Try to query the receipts table to check if status column exists
    const { data: receiptsData, error: receiptsError } = await supabase.from("receipts").select("status, paid").limit(1)

    if (receiptsError) {
      console.error("Error checking receipts table:", receiptsError)
      return NextResponse.json(
        {
          success: false,
          message: "Error checking receipts table",
          error: receiptsError.message,
        },
        { status: 500 },
      )
    }

    // Get table information using system tables
    const { data: columnsData, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "receipts")

    if (columnsError) {
      console.error("Error getting table info:", columnsError)
      return NextResponse.json(
        {
          success: false,
          message: "Error getting table information",
          error: columnsError.message,
        },
        { status: 500 },
      )
    }

    // Check if status and paid columns exist
    const hasStatusColumn = columnsData?.some((col) => col.column_name === "status")
    const hasPaidColumn = columnsData?.some((col) => col.column_name === "paid")

    return NextResponse.json({
      success: hasStatusColumn && hasPaidColumn,
      hasStatusColumn,
      hasPaidColumn,
      columns: columnsData,
      sample: receiptsData,
    })
  } catch (error) {
    console.error("Error in test-columns:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing columns",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
