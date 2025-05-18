import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    console.log("Fetching all staff members")
    const { data, error } = await supabase.from("staff").select("*").order("name")

    if (error) {
      console.error("Error fetching staff members:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch staff members",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Found ${data.length} staff members`)
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
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("Creating new staff member:", body)

    // Validate required fields
    if (!body.name || !body.phoneNumber || !body.role) {
      console.error("Missing required fields:", { body })
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

    console.log("Inserting staff member into database:", staffMember)

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

    console.log("Staff member created successfully:", data)
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
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
