import { TwilioDebugInfo } from "@/components/twilio-debug-info"

export default function TwilioTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Twilio Configuration Test</h1>
      <div className="max-w-md">
        <TwilioDebugInfo />
      </div>
    </div>
  )
}
