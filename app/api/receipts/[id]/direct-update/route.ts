import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, paid } = body

    console.log(`Direct SQL update for receipt ${id} with:`, { status, paid })

    const supabase = getSupabaseAdmin()

    // Build SQL query based on what was provided
    let sqlQuery = "UPDATE receipts SET "
    const updates = []

    if (status !== undefined) {
      updates.push(`status = '${status}'`)
    }

    if (paid !== undefined) {
      updates.push(`paid = ${paid}`)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid update data provided",
        },
        { status: 400 },
      )
    }

    sqlQuery += updates.join(", ")
    sqlQuery += ` WHERE id = '${id}' RETURNING id, status, paid;`

    console.log("Executing SQL:", sqlQuery)

    const { data, error } = await supabase.rpc("exec", { query: sqlQuery })

    if (error) {
      console.error("SQL execution error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
