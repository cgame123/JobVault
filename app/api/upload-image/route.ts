import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    // Check if the request is a multipart form
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 },
      )
    }

    // Get file extension
    const fileExt = file.name.split(".").pop()
    const fileName = `test-receipt-${uuidv4()}.${fileExt}`
    const filePath = `test-receipts/${fileName}`

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("receipts").upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

    if (error) {
      console.error("Error uploading file:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error uploading file",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from("receipts").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error("Error in upload endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error uploading file",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
