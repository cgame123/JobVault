import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const results = {
    database: { status: "unknown", details: null },
    twilio: { status: "unknown", details: null },
    receipts: { status: "unknown", details: null },
    staff: { status: "unknown", details: null },
    environment: { status: "unknown", details: {} },
  }

  // Check database connection
  try {
    const { data, error } = await supabase.from("receipts").select("count", { count: "exact", head: true })

    if (error) {
      results.database = { status: "error", details: error.message }
    } else {
      results.database = { status: "ok", details: "Connected to Supabase" }
    }
  } catch (error) {
    results.database = { status: "error", details: String(error) }
  }

  // Check receipts
  try {
    const { data, error } = await supabase.from("receipts").select("*").limit(1)

    if (error) {
      results.receipts = { status: "error", details: error.message }
    } else if (data && data.length > 0) {
      results.receipts = { status: "ok", details: `Found ${data.length} receipts` }
    } else {
      results.receipts = { status: "warning", details: "No receipts found" }
    }
  } catch (error) {
    results.receipts = { status: "error", details: String(error) }
  }

  // Check staff
  try {
    const { data, error } = await supabase.from("staff").select("*").limit(1)

    if (error) {
      results.staff = { status: "error", details: error.message }
    } else if (data && data.length > 0) {
      results.staff = { status: "ok", details: `Found ${data.length} staff members` }
    } else {
      results.staff = { status: "warning", details: "No staff members found" }
    }
  } catch (error) {
    results.staff = { status: "error", details: String(error) }
  }

  // Check Twilio credentials
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

  if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
    results.twilio = { status: "ok", details: "Twilio credentials found" }
  } else {
    const missing = []
    if (!twilioAccountSid) missing.push("TWILIO_ACCOUNT_SID")
    if (!twilioAuthToken) missing.push("TWILIO_AUTH_TOKEN")
    if (!twilioPhoneNumber) missing.push("TWILIO_PHONE_NUMBER")
    results.twilio = { status: "warning", details: `Missing: ${missing.join(", ")}` }
  }

  // Check environment variables
  const envVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "GROQ_API_KEY",
  ]

  const envStatus = {}
  let allEnvOk = true

  for (const envVar of envVars) {
    const isSet = !!process.env[envVar]
    envStatus[envVar] = isSet ? "✅" : "❌"
    if (!isSet) allEnvOk = false
  }

  results.environment = {
    status: allEnvOk ? "ok" : "warning",
    details: envStatus,
  }

  return NextResponse.json({
    success: true,
    message: "System status check complete",
    results,
  })
}
