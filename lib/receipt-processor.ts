import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"

// Define the schema for receipt data extraction
const receiptSchema = {
  type: "object",
  properties: {
    vendor: {
      type: "string",
      description: "The name of the vendor or store",
    },
    amount: {
      type: "number",
      description: "The total amount of the purchase in dollars",
    },
    date: {
      type: "string",
      description: "The date of purchase in YYYY-MM-DD format",
    },
  },
  required: ["vendor", "amount", "date"],
}

export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting receipt processing for image:", imageUrl)

    // Fetch the image
    console.log("Fetching image...")
    const imageResponse = await fetch(imageUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
        ).toString("base64")}`,
      },
    })

    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString("base64")
    console.log("Image fetched and converted to base64")

    // Use OCR to extract text from the image (mock for now)
    const ocrText = await extractTextFromImage(base64Image)
    console.log("OCR text extracted")

    // Use Groq to extract structured data from the OCR text
    console.log("Calling Groq model...")

    // Include the message text as a hint if available
    const promptHint = messageText
      ? `The user sent this message with the receipt: "${messageText}". This might indicate the vendor name.`
      : ""

    const { object } = await generateObject({
      model: groq("llama-3.1-8b-instant"),
      prompt: `Extract the following information from this receipt: 
      1. Vendor name (store name)
      2. Total amount (in dollars)
      3. Purchase date (in YYYY-MM-DD format)
      
      ${promptHint}
      
      Receipt text:
      ${ocrText}`,
      schema: receiptSchema,
    })

    console.log("Groq processing complete, received:", object)
    return object
  } catch (error) {
    console.error("Error in processReceiptImage:", error)

    // Return fallback data using the message text as vendor if available
    return {
      vendor: messageText || "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  }
}

// This is a placeholder function - in a real app, you would use a proper OCR service
async function extractTextFromImage(base64Image: string): Promise<string> {
  // In a real implementation, you would use an OCR service like Google Cloud Vision,
  // Azure Computer Vision, or Tesseract.js

  // For this example, we'll just return a mock result that looks like a receipt
  return `RECEIPT
Trader Joe's
123 Main St
Anytown, USA

Date: 05/17/2025

Item 1 $45.99
Item 2 $29.99
Item 3 $53.97

Subtotal: $129.95
Tax: $0.00
Total: $129.95

Thank you for shopping with us!`
}
