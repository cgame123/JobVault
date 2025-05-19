// Simple receipt processor without AI integration
export async function processReceiptImage(
  imageUrl: string,
  messageText?: string,
): Promise<{
  vendor: string
  amount: number
  date: string
}> {
  try {
    console.log("Starting basic receipt processing for image:", imageUrl)

    // Use the message text as the vendor name if available
    const vendor = messageText && messageText.trim() !== "" ? messageText.trim() : "Unknown Vendor"

    // Return basic receipt data
    return {
      vendor: vendor,
      amount: 0, // Default amount
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  } catch (error) {
    console.error("Error in processReceiptImage:", error)

    // Return fallback data
    return {
      vendor: messageText || "Unknown Vendor",
      amount: 0,
      date: new Date().toISOString().split("T")[0], // Today's date
    }
  }
}
