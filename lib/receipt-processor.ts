// Receipt processor with fixed values for testing
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
    console.log("Using fixed values for receipt data")

    // Use fixed values as requested
    return {
      vendor: "Trader Joe's",
      amount: 51.91,
      date: "2025-05-16", // Using ISO format YYYY-MM-DD for database compatibility
    }
  } catch (error) {
    console.error("Error in processReceiptImage:", error)

    // Even in case of error, return the fixed values
    return {
      vendor: "Trader Joe's",
      amount: 51.91,
      date: "2025-05-16",
    }
  }
}
