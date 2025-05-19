import { NextResponse } from "next/server"
import { sendConfirmationSMS } from "@/lib/twilio-sender"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get("to")
  const message = searchParams.get("message") || "This is a test message from JobVault!"

  if (!to) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing 'to' parameter. Use ?to=+1234567890",
      },
      { status: 400 },
    )
  }

  try {
    await sendConfirmationSMS(to, message)
    return NextResponse.json({
      success: true,
      message: `Test SMS sent to ${to}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    )
  }
}
