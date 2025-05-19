import { processReceiptWithAPI } from "./receipt-api"

export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting receipt processing with API for image:", imageUrl)

    // Process the receipt with the API
    const receiptData = await processReceiptWithAPI(imageUrl)

    // If API couldn't determine the vendor but we have message text, use that
    if (receiptData.vendor === "Unknown Vendor" && messageText && messageText.trim() !== "") {
      receiptData.vendor = messageText.trim()
    }

    console.log("Extracted receipt data:", receiptData)

    return {
      vendor: receiptData.vendor,
      amount: receiptData.amount,
      date: receiptData.date,
    }
  } catch (error) {
    console.error("Error in receipt processing:", error)

    // Return fallback data
    return {
      vendor: messageText || "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  }
}
