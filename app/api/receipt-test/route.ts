import { NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { getMediaContent } from "@/lib/twilio-client"
import sharp from "sharp"

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    let imageUrl = searchParams.get("imageUrl")
    const sample = searchParams.get("sample")

    // If a sample name is provided, use that sample receipt
    if (sample && SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS]) {
      imageUrl = SAMPLE_RECEIPTS[sample as keyof typeof SAMPLE_RECEIPTS]
    }

    // If no image URL is provided, use the Home Depot receipt as default
    if (!imageUrl) {
      imageUrl = SAMPLE_RECEIPTS["home-depot"]
    }

    console.log("Testing receipt extraction with image:", imageUrl)

    try {
      // Fetch the image using authenticated request if it's a Twilio URL
      const imageBuffer = await getMediaContent(imageUrl)
      console.log("Successfully downloaded image, size:", imageBuffer.length, "bytes")

      // Resize the image to reduce size (lower resolution = fewer tokens)
      const resizedImageBuffer = await sharp(imageBuffer)
        .resize(400) // Resize to 400px width (maintaining aspect ratio)
        .jpeg({ quality: 50 }) // Convert to JPEG with 50% quality
        .toBuffer()

      console.log("Resized image size:", resizedImageBuffer.length, "bytes")

      // Convert image to base64 for the prompt
      const base64Image = resizedImageBuffer.toString("base64")

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
        result = {
          vendor: "Unknown Vendor",
          amount: 0,
          date: new Date().toISOString().split("T")[0],
        }
      }

      // Ensure we have all required fields with proper types
      const vendor = result.vendor || "Unknown Vendor"

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
        message: "Receipt processed successfully",
        data: extractedData,
        imageUsed: imageUrl,
      })
    } catch (error) {
      console.error("Error processing image:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error processing image",
          error: String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in receipt test endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error in receipt test endpoint",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
