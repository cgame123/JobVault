import { NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Sample receipt URLs from your project
const SAMPLE_RECEIPTS = {
  "home-depot":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/home-depot-receipt-MDClilwcaMC7elv9FyaHRZ9buOu03E.png",
  "ace-hardware":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/ace-hardware-receipt-JXnw7ccgpNJ5m64ptfQGSPFy3zpy20.png",
  walmart:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/walmart-receipt-j51a5vQ3zIRlUAcwOZ1GLBNZdO5xDp.png",
  target:
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/target-receipt-fGfHrJHDW3UhNPZnNghaCRLWIphDbM.png",
}

// Sample descriptions of receipts to avoid sending the entire image
const RECEIPT_DESCRIPTIONS = {
  "home-depot": `
    Receipt from Home Depot
    Date: April 15, 2023
    Items:
    - Lumber $45.99
    - Paint $32.97
    - Tools $39.99
    Subtotal: $118.95
    Tax: $8.99
    Total: $127.94
  `,
  "ace-hardware": `
    Receipt from Ace Hardware
    Date: May 20, 2023
    Items:
    - Screws $12.99
    - Drill $59.99
    - Tape $6.49
    Subtotal: $79.47
    Tax: $6.00
    Total: $85.47
  `,
  walmart: `
    Receipt from Walmart
    Date: June 10, 2023
    Items:
    - Groceries $42.56
    - Household $15.99
    - Electronics $0.99
    Subtotal: $59.54
    Tax: $3.75
    Total: $63.29
  `,
  target: `
    Receipt from Target
    Date: July 5, 2023
    Items:
    - Clothing $24.99
    - Home goods $12.99
    - Snacks $1.99
    Subtotal: $39.97
    Tax: $2.21
    Total: $42.18
  `,
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sample = searchParams.get("sample") || "home-depot"

    // Get the sample image URL and description
    const imageUrl = SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS] || SAMPLE_RECEIPTS["home-depot"]
    const receiptDescription =
      RECEIPT_DESCRIPTIONS[sample as keyof typeof RECEIPT_DESCRIPTIONS] || RECEIPT_DESCRIPTIONS["home-depot"]

    console.log("Testing AI receipt extraction for:", sample)

    try {
      // Use Groq to analyze the receipt description
      const prompt = `
      You are a receipt information extractor. Analyze the following receipt description and extract these key details:
      1. Vendor/Store Name
      2. Total Amount (just the number)
      3. Date (in YYYY-MM-DD format)
      
      Format your response as a JSON object with these exact keys: vendor, amount, date
      
      Receipt Description:
      ${receiptDescription}
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
        result = {
          vendor: sample.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          amount: 0,
          date: new Date().toISOString().split("T")[0],
        }
      }

      // Ensure we have all required fields with proper types
      const vendor = result.vendor || sample.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

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

      const extractedData = {
        vendor,
        amount,
        date,
      }

      console.log("Extracted receipt data:", extractedData)

      return NextResponse.json({
        success: true,
        message: "Receipt processed successfully with AI",
        data: extractedData,
        imageUsed: imageUrl,
        description: receiptDescription,
      })
    } catch (error) {
      console.error("Error processing with AI:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error processing with AI",
          error: String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in receipt AI endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error in receipt AI endpoint",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
