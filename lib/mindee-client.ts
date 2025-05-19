import { Client, Receipt } from "mindee"

// Initialize the Mindee client with your API key
const mindeeClient = new Client({ apiKey: process.env.MINDEE_API_KEY })

/**
 * Process a receipt image using Mindee API
 * @param imageUrl URL of the receipt image
 * @returns Extracted receipt data
 */
export async function processReceiptWithMindee(imageUrl: string): Promise<{
  vendor: string
  amount: number
  date: string
  items?: Array<{ description: string; amount: number }>
}> {
  try {
    console.log("Processing receipt with Mindee:", imageUrl)

    // Download the image
    const response = await fetch(imageUrl)
    const imageBuffer = await response.arrayBuffer()

    // Parse the receipt using Mindee
    const inputSource = mindeeClient.docFromBuffer(Buffer.from(imageBuffer), imageUrl.split("/").pop() || "receipt.jpg")
    const apiResponse = await mindeeClient.parse(Receipt, inputSource)

    // Get the parsed data
    const document = apiResponse.document

    // Extract vendor information
    const vendor = document.merchantName?.value || "Unknown Vendor"

    // Extract total amount
    const amount = document.totalAmount?.value || 0

    // Extract date
    const date = document.date?.value
      ? new Date(document.date.value).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    // Extract line items if available
    const items = document.lineItems?.map((item) => ({
      description: item.description || "Unknown Item",
      amount: item.totalAmount || 0,
    }))

    console.log("Mindee extraction results:", { vendor, amount, date, itemCount: items?.length || 0 })

    return {
      vendor,
      amount,
      date,
      items,
    }
  } catch (error) {
    console.error("Error processing receipt with Mindee:", error)

    // Return default values if Mindee processing fails
    return {
      vendor: "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    }
  }
}
