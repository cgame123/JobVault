import { v4 as uuidv4 } from "uuid"
import { supabase } from "./supabase"
import type { StaffMember } from "./types"

// Store a staff member in Supabase
export async function storeStaffMember(staff: StaffMember): Promise<StaffMember> {
  try {
    // Ensure staff has an ID
    if (!staff.id) {
      staff.id = uuidv4()
    }

    // Insert the staff member into Supabase
    const { data, error } = await supabase
      .from("staff")
      .insert({
        id: staff.id,
        name: staff.name,
        phone_number: staff.phoneNumber,
        role: staff.role,
        property: staff.property || null,
        created_at: staff.createdAt,
      })
      .select()
      .single()

    if (error) {
      console.error("Error storing staff member in Supabase:", error)
      throw error
    }

    console.log(`Staff member stored in Supabase: ${staff.id}`)
    return staff
  } catch (error) {
    console.error("Error storing staff member:", error)
    throw error
  }
}

// Get all staff members from Supabase
export async function getAllStaffMembers(): Promise<StaffMember[]> {
  try {
    const { data, error } = await supabase.from("staff").select("*").order("name")

    if (error) {
      console.error("Error fetching staff members from Supabase:", error)
      throw error
    }

    // Convert the database rows to StaffMember objects
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      phoneNumber: row.phone_number,
      role: row.role,
      property: row.property || undefined,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting staff members:", error)
    // Return empty array instead of throwing to prevent page errors
    return []
  }
}

// Get a staff member by phone number
export async function getStaffMemberByPhoneNumber(phoneNumber: string): Promise<StaffMember | null> {
  try {
    const { data, error } = await supabase.from("staff").select("*").eq("phone_number", phoneNumber).single()

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 means no rows returned
        return null
      }
      console.error("Error fetching staff member by phone number from Supabase:", error)
      throw error
    }

    return {
      id: data.id,
      name: data.name,
      phoneNumber: data.phone_number,
      role: data.role,
      property: data.property || undefined,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error("Error getting staff member by phone number:", error)
    return null
  }
}
