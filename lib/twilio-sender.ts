import twilio from "twilio"

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

// Create Twilio client
const client = twilio(accountSid, authToken)

/**
 * Sends a confirmation SMS to the user
 * @param to The phone number to send the SMS to
 * @param message The message to send
 * @returns Promise that resolves when the message is sent
 */
export async function sendConfirmationSMS(to: string, message: string): Promise<void> {
  try {
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("❌ Twilio credentials not configured")
      return
    }

    console.log(`📤 Sending confirmation SMS to ${to}: ${message}`)

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    })

    console.log(`✅ SMS sent successfully, SID: ${result.sid}`)
  } catch (error) {
    console.error("❌ Error sending confirmation SMS:", error)
    // Don't throw the error - we don't want to fail the main process if SMS fails
  }
}
