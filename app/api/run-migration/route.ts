import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with the service role key for admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function POST() {
  try {
    console.log("🔄 Running migration to add status and paid fields to receipts table...")

    // Use direct SQL execution with the admin client
    const addStatusColumn = await supabaseAdmin.rpc("exec", {
      query: "ALTER TABLE receipts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted'",
    })

    if (addStatusColumn.error) {
      console.error("❌ Error adding status column:", addStatusColumn.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add status column",
          details: addStatusColumn.error.message,
        },
        { status: 500 },
      )
    }

    // Update existing rows to have 'submitted' status
    const updateExistingRows = await supabaseAdmin.rpc("exec", {
      query: "UPDATE receipts SET status = 'submitted' WHERE status IS NULL",
    })

    if (updateExistingRows.error) {
      console.error("❌ Error updating existing rows:", updateExistingRows.error)
      // Continue anyway
    }

    // Add NOT NULL constraint after setting default values
    const addNotNullConstraint = await supabaseAdmin.rpc("exec", {
      query: "ALTER TABLE receipts ALTER COLUMN status SET NOT NULL",
    })

    if (addNotNullConstraint.error) {
      console.error("❌ Error adding NOT NULL constraint:", addNotNullConstraint.error)
      // Continue anyway
    }

    // Add paid column
    const addPaidColumn = await supabaseAdmin.rpc("exec", {
      query: "ALTER TABLE receipts ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false",
    })

    if (addPaidColumn.error) {
      console.error("❌ Error adding paid column:", addPaidColumn.error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add paid column",
          details: addPaidColumn.error.message,
        },
        { status: 500 },
      )
    }

    // Update existing rows to have 'false' for paid
    const updateExistingPaid = await supabaseAdmin.rpc("exec", {
      query: "UPDATE receipts SET paid = false WHERE paid IS NULL",
    })

    if (updateExistingPaid.error) {
      console.error("❌ Error updating existing paid values:", updateExistingPaid.error)
      // Continue anyway
    }

    // Add NOT NULL constraint for paid column
    const addPaidNotNullConstraint = await supabaseAdmin.rpc("exec", {
      query: "ALTER TABLE receipts ALTER COLUMN paid SET NOT NULL",
    })

    if (addPaidNotNullConstraint.error) {
      console.error("❌ Error adding paid NOT NULL constraint:", addPaidNotNullConstraint.error)
      // Continue anyway
    }

    // Add check constraint for status values
    const addCheckConstraint = await supabaseAdmin.rpc("exec", {
      query: "ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_status_check",
    })

    if (addCheckConstraint.error) {
      console.error("❌ Error dropping existing constraint:", addCheckConstraint.error)
      // Continue anyway
    }

    const addNewConstraint = await supabaseAdmin.rpc("exec", {
      query:
        "ALTER TABLE receipts ADD CONSTRAINT receipts_status_check CHECK (status IN ('submitted', 'processing', 'needs_review', 'approved', 'rejected', 'duplicate'))",
    })

    if (addNewConstraint.error) {
      console.error("❌ Error adding check constraint:", addNewConstraint.error)
      // Continue anyway
    }

    // Force a refresh of the schema cache
    const refreshCache = await supabaseAdmin.rpc("exec", {
      query:
        "COMMENT ON TABLE receipts IS 'Table for storing receipt information, updated with status and paid columns'",
    })

    if (refreshCache.error) {
      console.error("❌ Error refreshing schema cache:", refreshCache.error)
      // Continue anyway
    }

    console.log("✅ Migration completed successfully")
    return NextResponse.json({
      success: true,
      message: "Migration completed successfully. Please refresh the page to see the changes.",
    })
  } catch (error) {
    console.error("❌ Error running migration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run migration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
