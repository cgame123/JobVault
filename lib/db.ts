import { neon } from "@neondatabase/serverless"
import { v4 as uuidv4 } from "uuid"
import type { Receipt, StaffMember } from "./types"

// Create a SQL client
const sql = neon(process.env.DATABASE_URL!)

// Initialize the database by creating necessary tables
export async function initDatabase() {
  try {
    // Create the staff table
    await sql`
      CREATE TABLE IF NOT EXISTS staff (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        property TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create the receipts table
    await sql`
      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        phone_number TEXT NOT NULL,
        staff_id UUID REFERENCES staff(id),
        staff_name TEXT,
        image_url TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for better query performance
    await sql`CREATE INDEX IF NOT EXISTS idx_receipts_phone_number ON receipts(phone_number)`
    await sql`CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_staff_phone_number ON staff(phone_number)`

    console.log("Database initialized successfully")
    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Store a receipt in the database
export async function storeReceipt(receipt: Receipt): Promise<Receipt> {
  try {
    // Ensure receipt has an ID
    if (!receipt.id) {
      receipt.id = uuidv4()
    }

    // Insert the receipt into the database
    await sql`
      INSERT INTO receipts (
        id, vendor, amount, date, phone_number, staff_id, staff_name, image_url, created_at
      ) VALUES (
        ${receipt.id},
        ${receipt.vendor},
        ${receipt.amount},
        ${receipt.date},
        ${receipt.phoneNumber},
        ${receipt.staffId || null},
        ${receipt.staffName || null},
        ${receipt.imageUrl},
        ${receipt.createdAt}
      )
    `

    console.log(`Receipt stored in database: ${receipt.id}`)
    return receipt
  } catch (error) {
    console.error("Error storing receipt:", error)
    throw error
  }
}

// Get all receipts from the database
export async function getAllReceipts(): Promise<Receipt[]> {
  try {
    const rows = await sql`
      SELECT * FROM receipts
      ORDER BY created_at DESC
    `

    // Convert the database rows to Receipt objects
    return rows.map((row) => ({
      id: row.id,
      vendor: row.vendor,
      amount: Number(row.amount),
      date: row.date,
      phoneNumber: row.phone_number,
      staffId: row.staff_id,
      staffName: row.staff_name,
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
    const rows = await sql`
      SELECT * FROM receipts
      WHERE id = ${id}
    `

    if (rows.length === 0) {
      return null
    }

    const row = rows[0]
    return {
      id: row.id,
      vendor: row.vendor,
      amount: Number(row.amount),
      date: row.date,
      phoneNumber: row.phone_number,
      staffId: row.staff_id,
      staffName: row.staff_name,
      imageUrl: row.image_url,
      createdAt: row.created_at,
    }
  } catch (error) {
    console.error("Error getting receipt by ID:", error)
    return null
  }
}

// Store a staff member in the database
export async function storeStaffMember(staff: StaffMember): Promise<StaffMember> {
  try {
    // Ensure staff has an ID
    if (!staff.id) {
      staff.id = uuidv4()
    }

    // Insert the staff member into the database
    await sql`
      INSERT INTO staff (
        id, name, phone_number, role, property, created_at
      ) VALUES (
        ${staff.id},
        ${staff.name},
        ${staff.phoneNumber},
        ${staff.role},
        ${staff.property || null},
        ${staff.createdAt}
      )
    `

    console.log(`Staff member stored in database: ${staff.id}`)
    return staff
  } catch (error) {
    console.error("Error storing staff member:", error)
    throw error
  }
}

// Get all staff members from the database
export async function getAllStaffMembers(): Promise<StaffMember[]> {
  try {
    const rows = await sql`
      SELECT * FROM staff
      ORDER BY name
    `

    // Convert the database rows to StaffMember objects
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      phoneNumber: row.phone_number,
      role: row.role,
      property: row.property,
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
    const rows = await sql`
      SELECT * FROM staff
      WHERE phone_number = ${phoneNumber}
    `

    if (rows.length === 0) {
      return null
    }

    const row = rows[0]
    return {
      id: row.id,
      name: row.name,
      phoneNumber: row.phone_number,
      role: row.role,
      property: row.property,
      createdAt: row.created_at,
    }
  } catch (error) {
    console.error("Error getting staff member by phone number:", error)
    return null
  }
}
