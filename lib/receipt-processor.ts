import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getMediaContent } from "./twilio-client"

export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting AI receipt processing for image:", imageUrl)

    // Download the image content
    const imageBuffer = await getMediaContent(imageUrl)

    // Convert image to base64 for the prompt
    const base64Image = imageBuffer.toString("base64")

    // Create a prompt for the AI to extract receipt information
    const prompt = `
    You are a receipt information extractor. Analyze the following receipt image and extract these key details:
    1. Vendor/Store Name
    2. Total Amount (just the number)
    3. Date (in YYYY-MM-DD format)
    
    If you cannot determine any field with certainty, use these defaults:
    - Vendor: "Unknown Vendor"
    - Amount: 0
    - Date: ${new Date().toISOString().split("T")[0]} (today's date)
    
    Format your response as a JSON object with these exact keys: vendor, amount, date
    
    Receipt Image (base64): ${base64Image}
    `

    // Use Groq to analyze the receipt
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
      maxTokens: 500,
    })

    console.log("AI response:", text)

    // Parse the JSON response
    let result
    try {
      // Find JSON in the response (in case the model adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No valid JSON found in response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      // Fallback to basic extraction
      result = extractBasicReceiptInfo(text, messageText)
    }

    // Ensure we have all required fields with proper types
    const vendor = result.vendor || messageText || "Unknown Vendor"

    // Convert amount to number and handle currency symbols
    let amount = 0
    if (typeof result.amount === "number") {
      amount = result.amount
    } else if (typeof result.amount === "string") {
      // Remove currency symbols and commas
      const cleanAmount = result.amount.replace(/[$,£€]/g, "").trim()
      amount = Number.parseFloat(cleanAmount) || 0
    }

    // Validate and format date
    let date = new Date().toISOString().split("T")[0] // Default to today
    if (result.date) {
      // Try to parse the date
      const parsedDate = new Date(result.date)
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split("T")[0]
      }
    }

    console.log("Extracted receipt data:", { vendor, amount, date })

    return {
      vendor,
      amount,
      date,
    }
  } catch (error) {
    console.error("Error in AI receipt processing:", error)

    // Return fallback data
    return {
      vendor: messageText || "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  }
}

// Fallback function to extract basic info without AI
function extractBasicReceiptInfo(
  aiText: string,
  messageText?: string,
): { vendor: string; amount: number; date: string } {
  // Try to extract information from the AI text even if JSON parsing failed
  const vendorMatch = aiText.match(/vendor[:\s]+([^\n,]+)/i)
  const amountMatch = aiText.match(/amount[:\s]+([\d.]+)/i)
  const dateMatch = aiText.match(/date[:\s]+(\d{4}-\d{2}-\d{2})/i)

  return {
    vendor: vendorMatch ? vendorMatch[1].trim() : messageText || "Unknown Vendor",
    amount: amountMatch ? Number.parseFloat(amountMatch[1]) : 0,
    date: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
  }
}
