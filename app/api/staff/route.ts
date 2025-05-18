import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const { data, error } = await supabase.from("staff").select("*").order("name")

    if (error) {
      console.error("Error fetching staff members:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch staff members",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error fetching staff members:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch staff members",
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.phoneNumber || !body.role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, phoneNumber, and role are required",
        },
        { status: 400 },
      )
    }

    // Create staff member object
    const staffMember = {
      id: uuidv4(),
      name: body.name,
      phone_number: body.phoneNumber,
      role: body.role,
      property: body.property || null,
      created_at: new Date().toISOString(),
    }

    // Store in database
    const { data, error } = await supabase.from("staff").insert(staffMember).select().single()

    if (error) {
      console.error("Error creating staff member:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create staff member",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error creating staff member:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create staff member",
      },
      { status: 500 },
    )
  }
}
