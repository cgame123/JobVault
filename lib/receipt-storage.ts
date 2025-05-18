import type { Receipt } from "./types"

// In-memory storage for receipts (temporary solution)
// In a real app, you would use a database
const receipts: Receipt[] = []

export function storeReceipt(receipt: Receipt): Receipt {
  // Add the receipt to our in-memory storage
  receipts.push(receipt)
  console.log(`Receipt stored: ${receipt.id} from ${receipt.vendor} for $${receipt.amount}`)
  return receipt
}

export function getAllReceipts(): Receipt[] {
  return [...receipts]
}

export function getReceiptById(id: string): Receipt | undefined {
  return receipts.find((receipt) => receipt.id === id)
}
