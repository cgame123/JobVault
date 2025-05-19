import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getMediaContent } from "./twilio-client"
import { createWorker } from "tesseract.js"

export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting OCR-based receipt processing for image:", imageUrl)

    // Download the image content
    const imageBuffer = await getMediaContent(imageUrl)

    // Step 1: Extract text from the image using OCR
    console.log("Starting OCR text extraction...")
    const worker = await createWorker()
    const { data } = await worker.recognize(imageBuffer)
    await worker.terminate()

    const extractedText = data.text
    console.log("OCR extracted text:", extractedText)

    // Step 2: Use Groq to analyze the extracted text
    const prompt = `
    You are a receipt information extractor. Analyze the following receipt text and extract these key details:
    1. Vendor/Store Name
    2. Total Amount (just the number)
    3. Date (in YYYY-MM-DD format)
    
    If you cannot determine any field with certainty, use these defaults:
    - Vendor: "${messageText || "Unknown Vendor"}"
    - Amount: 0
    - Date: ${new Date().toISOString().split("T")[0]} (today's date)
    
    Format your response as a JSON object with these exact keys: vendor, amount, date
    
    Receipt Text:
    ${extractedText}
    `

    // Use Groq to analyze the receipt text
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
      result = extractBasicReceiptInfo(extractedText, messageText)
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
    console.error("Error in OCR receipt processing:", error)

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
  ocrText: string,
  messageText?: string,
): { vendor: string; amount: number; date: string } {
  // Try to extract information from the OCR text

  // Look for vendor name in the first few lines
  const lines = ocrText.split("\n").filter((line) => line.trim() !== "")
  const potentialVendor = lines.length > 0 ? lines[0].trim() : messageText || "Unknown Vendor"

  // Look for total amount
  const totalRegex = /(?:total|amount|sum)(?:\s*:)?\s*[$]?(\d+\.\d{2})/i
  const amountMatch = ocrText.match(totalRegex)
  const amount = amountMatch ? Number.parseFloat(amountMatch[1]) : 0

  // Look for date
  const dateRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/
  const dateMatch = ocrText.match(dateRegex)
  let date = new Date().toISOString().split("T")[0] // Default to today

  if (dateMatch) {
    const month = Number.parseInt(dateMatch[1], 10)
    const day = Number.parseInt(dateMatch[2], 10)
    let year = Number.parseInt(dateMatch[3], 10)

    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900
    }

    // Create date in YYYY-MM-DD format
    date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  }

  return {
    vendor: potentialVendor,
    amount,
    date,
  }
}
