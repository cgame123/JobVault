// Simple receipt processor without complex OCR or AI
export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting simple receipt processing for image:", imageUrl)

    // Use the message text as the vendor name if available
    const vendor = messageText && messageText.trim() !== "" ? messageText.trim() : "Unknown Vendor"

    // For a real implementation, we would use AI to extract this data
    // But for now, we'll use basic defaults

    return {
      vendor: vendor,
      amount: 0, // Default amount
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  } catch (error) {
    console.error("Error in simple receipt processing:", error)

    // Return fallback data
    return {
      vendor: messageText || "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  }
}
