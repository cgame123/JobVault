import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Create extension for UUID generation
    await supabaseAdmin.rpc("create_uuid_extension", {})

    // Create the staff table
    const { error: staffError } = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        property TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    if (staffError) {
      console.error("Error creating staff table:", staffError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create staff table",
          details: staffError,
        },
        { status: 500 },
      )
    }

    // Create the receipts table
    const { error: receiptsError } = await supabaseAdmin.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        phone_number TEXT NOT NULL,
        staff_id UUID REFERENCES staff(id),
        staff_name TEXT,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    if (receiptsError) {
      console.error("Error creating receipts table:", receiptsError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create receipts table",
          details: receiptsError,
        },
        { status: 500 },
      )
    }

    // Create indexes
    await supabaseAdmin.query(`
      CREATE INDEX IF NOT EXISTS idx_receipts_phone_number ON receipts(phone_number);
      CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
      CREATE INDEX IF NOT EXISTS idx_staff_phone_number ON staff(phone_number);
    `)

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error) {
    console.error("Error creating database tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create database tables",
        details: String(error),
      },
      { status: 500 },
    )
  }
}
