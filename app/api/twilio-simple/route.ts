import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    console.log("Simple Twilio webhook triggered")

    // Just acknowledge receipt without processing
    return NextResponse.json(
      {
        success: true,
        message: "Message received",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error in simple webhook:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
