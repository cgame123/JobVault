import { processReceiptWithMindee } from "./mindee-client"

export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting receipt processing with Mindee for image:", imageUrl)

    // Process the receipt with Mindee
    const receiptData = await processReceiptWithMindee(imageUrl)

    // If Mindee couldn't determine the vendor but we have message text, use that
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
