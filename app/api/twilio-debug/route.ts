import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("Received webhook request from Twilio")

    // Parse the form data from Twilio
    const formData = await req.formData()

    // Log all form data for debugging
    console.log("Form data keys:", [...formData.keys()])
    const data: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`)
      data[key] = value
    }

    // Return a success response with the data we received
    return NextResponse.json({
      success: true,
      message: "Debug endpoint received data",
      receivedData: data,
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
