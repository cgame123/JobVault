import { NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function GET() {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "GROQ_API_KEY environment variable is not set",
        },
        { status: 400 },
      )
    }

    console.log("Testing Groq connection...")

    // Test the Groq connection with a simple prompt
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: "What is the current date? Please respond with just the date in YYYY-MM-DD format.",
      maxTokens: 50,
    })

    console.log("Groq response:", text)

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Groq",
      response: text,
      apiKeyConfigured: true,
    })
  } catch (error) {
    console.error("Error testing Groq connection:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error testing Groq connection",
        error: String(error),
        apiKeyConfigured: !!process.env.GROQ_API_KEY,
      },
      { status: 500 },
    )
  }
}
