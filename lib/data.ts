import type { Receipt, StaffMember } from "./types"
import { getAllReceipts, getAllStaffMembers } from "./db"

// Get all receipts from the database
export async function getReceipts(): Promise<Receipt[]> {
  return getAllReceipts()
}

// Get all staff members from the database
export async function getStaffMembers(): Promise<StaffMember[]> {
  return getAllStaffMembers()
}
