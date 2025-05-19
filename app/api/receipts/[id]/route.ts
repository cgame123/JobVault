import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

  try {
    const { data, error } = await supabase
      .from("receipts")
      .select(`
        id,
        vendor,
        amount,
        date,
        phone_number,
        staff_id,
        staff_name,
        image_url,
        created_at,
        status,
        paid,
        staff:staff_id (
          name,
          phone_number,
          role,
          property
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching receipt:", error)
      return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
