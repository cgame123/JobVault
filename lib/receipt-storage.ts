import { v4 as uuidv4 } from "uuid"
import { supabase } from "./supabase"
import type { Receipt } from "./types"

// Store a receipt in Supabase
export async function storeReceipt(receipt: Receipt): Promise<Receipt> {
  try {
    // Ensure receipt has an ID
    if (!receipt.id) {
      receipt.id = uuidv4()
    }

    // Insert the receipt into Supabase
    const { data, error } = await supabase
      .from("receipts")
      .insert({
        id: receipt.id,
        vendor: receipt.vendor,
        amount: receipt.amount,
        date: receipt.date,
        phone_number: receipt.phoneNumber,
        staff_id: receipt.staffId || null,
        staff_name: receipt.staffName || null,
        image_url: receipt.imageUrl,
        created_at: receipt.createdAt,
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing receipt in Supabase:", error)
      throw error
    }

    console.log(`Receipt stored in Supabase: ${receipt.id}`)
    return receipt
  } catch (error) {
    console.error("Error storing receipt:", error)
    throw error
  }
}

// Get all receipts from Supabase
export async function getAllReceipts(): Promise<Receipt[]> {
  try {
    const { data, error } = await supabase.from("receipts").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching receipts from Supabase:", error)
      throw error
    }

    // Convert the database rows to Receipt objects
    return (data || []).map((row) => ({
      id: row.id,
      vendor: row.vendor,
      amount: row.amount,
      date: row.date,
      phoneNumber: row.phone_number,
      staffId: row.staff_id || undefined,
      staffName: row.staff_name || undefined,
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting receipts:", error)
    // Return empty array instead of throwing to prevent page errors
    return []
  }
}

// Get a receipt by ID
export async function getReceiptById(id: string): Promise<Receipt | null> {
  try {
    const { data, error } = await supabase.from("receipts").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 means no rows returned
        return null
      }
      console.error("Error fetching receipt by ID from Supabase:", error)
      throw error
    }

    return {
      id: data.id,
      vendor: data.vendor,
      amount: data.amount,
      date: data.date,
      phoneNumber: data.phone_number,
      staffId: data.staff_id || undefined,
      staffName: data.staff_name || undefined,
      imageUrl: data.image_url,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error("Error getting receipt by ID:", error)
    return null
  }
}
