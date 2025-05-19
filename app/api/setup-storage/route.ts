import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json(
        {
          success: false,
          message: "Error checking buckets",
          error: bucketsError.message,
        },
        { status: 500 },
      )
    }

    const receiptsBucketExists = buckets.some((bucket) => bucket.name === "receipts")

    if (!receiptsBucketExists) {
      // Create the receipts bucket
      const { error: createError } = await supabaseAdmin.storage.createBucket("receipts", {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      })

      if (createError) {
        return NextResponse.json(
          {
            success: false,
            message: "Error creating receipts bucket",
            error: createError.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: receiptsBucketExists ? "Receipts bucket already exists" : "Receipts bucket created successfully",
    })
  } catch (error) {
    console.error("Error setting up storage:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error setting up storage",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
