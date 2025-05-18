import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
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

    // Update staff member in Supabase
    const { data, error } = await supabase
      .from("staff")
      .update({
        name: body.name,
        phone_number: body.phoneNumber,
        role: body.role,
        property: body.property || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating staff member:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update staff member",
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
    console.error("Error updating staff member:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update staff member",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Delete staff member from Supabase
    const { error } = await supabase.from("staff").delete().eq("id", id)

    if (error) {
      console.error("Error deleting staff member:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete staff member",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting staff member:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete staff member",
      },
      { status: 500 },
    )
  }
}
