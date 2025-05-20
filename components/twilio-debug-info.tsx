"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function TwilioDebugInfo() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("Checking Twilio configuration...")
  const [details, setDetails] = useState<any>(null)

  const checkTwilioConfig = async () => {
    setStatus("loading")
    setMessage("Checking Twilio configuration...")

    try {
      const response = await fetch("/api/twilio-check")
      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Twilio configuration is valid!")
      } else {
        setStatus("error")
        setMessage(data.error || "Twilio configuration is invalid.")
      }

      setDetails(data)
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check Twilio configuration.")
      setDetails({ error: error instanceof Error ? error.message : "Unknown error" })
    }
  }

  useEffect(() => {
    checkTwilioConfig()
  }, [])

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          {status === "loading" && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100 mr-2"></div>
          )}
          {status === "success" && <CheckCircle className="h-5 w-5 text-green-500 mr-2" />}
          {status === "error" && <AlertCircle className="h-5 w-5 text-red-500 mr-2" />}
          Twilio Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={`mb-4 ${status === "error" ? "text-red-400" : status === "success" ? "text-green-400" : "text-zinc-400"}`}
        >
          {message}
        </p>

        {details && (
          <div className="text-xs text-zinc-500 space-y-1">
            <p>Account SID: {details.accountSidExists ? "✓ Present" : "✗ Missing"}</p>
            <p>Auth Token: {details.authTokenExists ? "✓ Present" : "✗ Missing"}</p>
            <p>Phone Number: {details.phoneNumberExists ? "✓ Present" : "✗ Missing"}</p>
            {details.accountStatus && <p>Account Status: {details.accountStatus}</p>}
          </div>
        )}

        <Button variant="outline" size="sm" className="mt-4" onClick={checkTwilioConfig}>
          Check Again
        </Button>
      </CardContent>
    </Card>
  )
}
