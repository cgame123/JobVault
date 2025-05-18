import twilio from "twilio"

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

// Create Twilio client
export const twilioClient = twilio(accountSid, authToken)

// Function to get the actual content of a media item
export async function getMediaContent(mediaUrl: string): Promise<Buffer> {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured")
  }

  // Make authenticated request to Twilio
  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`)
  }

  // Get the binary data
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
