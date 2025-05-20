import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Twilio environment variables are set
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    // Basic validation
    const accountSidExists = !!accountSid
    const authTokenExists = !!authToken
    const phoneNumberExists = !!phoneNumber

    // If any credentials are missing, return error
    if (!accountSidExists || !authTokenExists) {
      return NextResponse.json({
        success: false,
        error: "Twilio credentials are missing",
        accountSidExists,
        authTokenExists,
        phoneNumberExists,
      })
    }

    // Try to make a simple request to Twilio API
    try {
      // Create a basic auth header
      const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`

      // Make a request to Twilio API to check if credentials are valid
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: {
          Authorization: authHeader,
        },
      })

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `Twilio API returned status ${response.status}: ${response.statusText}`,
          accountSidExists,
          authTokenExists,
          phoneNumberExists,
        })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        accountSidExists,
        authTokenExists,
        phoneNumberExists,
        accountStatus: data.status,
      })
    } catch (apiError) {
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Twilio API: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
        accountSidExists,
        authTokenExists,
        phoneNumberExists,
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    })
  }
}
