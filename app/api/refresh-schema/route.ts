import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Create a new Supabase client to force schema refresh
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Try to query the receipts table to refresh schema
    const { data, error } = await supabase.from("receipts").select("*").limit(1)

    if (error) {
      console.error("Error refreshing schema:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error refreshing schema",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Try to get table information to verify schema is refreshed
    const { data: columnsData, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "receipts")

    if (columnsError) {
      console.error("Error getting table info after refresh:", columnsError)
      return NextResponse.json(
        {
          success: false,
          message: "Error getting table information after refresh",
          error: columnsError.message,
        },
        { status: 500 },
      )
    }

    // Check if status and paid columns exist
    const hasStatusColumn = columnsData?.some((col) => col.column_name === "status")
    const hasPaidColumn = columnsData?.some((col) => col.column_name === "paid")

    return NextResponse.json({
      success: true,
      message: "Schema refreshed successfully",
      hasStatusColumn,
      hasPaidColumn,
      columns: columnsData,
    })
  } catch (error) {
    console.error("Error refreshing schema:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error refreshing schema",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
