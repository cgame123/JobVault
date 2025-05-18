import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "API is working!",
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  })
}
