import fetch from "node-fetch"

/**
 * Process a receipt image using a receipt parsing API
 * @param imageUrl URL of the receipt image
 * @returns Extracted receipt data
 */
export async function processReceiptWithAPI(imageUrl: string): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Processing receipt with API:", imageUrl)

    // Check if we have an API key
    if (!process.env.MINDEE_API_KEY) {
      throw new Error("MINDEE_API_KEY environment variable is not set")
    }

    // Download the image first
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    // Create form data with the image
    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: "image/jpeg" })
    formData.append("document", blob, "receipt.jpg")

    // Send the image to Mindee API
    const apiResponse = await fetch("https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.MINDEE_API_KEY}`,
      },
      body: formData,
    })

    // Parse the response
    const result = await apiResponse.json()

    // Check if the API call was successful
    if (!apiResponse.ok) {
      console.error("API error:", result)
      throw new Error(`API error: ${result.message || "Unknown error"}`)
    }

    // Extract the relevant data
    const document = result.document
    const prediction = document.inference.prediction

    // Extract vendor information
    const vendor = prediction.supplier_name?.value || "Unknown Vendor"

    // Extract total amount
    const amount = prediction.total_amount?.value || 0

    // Extract date
    const date = prediction.date?.value
      ? new Date(prediction.date.value).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]

    console.log("API extraction results:", { vendor, amount, date })

    return {
      vendor,
      amount,
      date,
    }
  } catch (error) {
    console.error("Error processing receipt with API:", error)

    // Return default values if API processing fails
    return {
      vendor: "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    }
  }
}
