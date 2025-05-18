import { StaffHeader } from "@/components/staff-header"
import { StaffTable } from "@/components/staff-table"
import { supabase } from "@/lib/supabase"
import type { StaffMember } from "@/lib/types"

// Function to fetch staff members from Supabase with cache busting
export const revalidate = 0 // Disable caching for this page

// Function to fetch staff members from Supabase
async function getStaffMembers(): Promise<StaffMember[]> {
  const { data, error } = await supabase.from("staff").select("*").order("name")

  if (error) {
    console.error("Error fetching staff members:", error)
    return []
  }

  // Map the database records to our StaffMember type
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    phoneNumber: row.phone_number,
    role: row.role,
    property: row.property,
    createdAt: row.created_at,
  }))
}

export default async function StaffPage() {
  // Fetch staff members
  const staffMembers = await getStaffMembers()

  // Log for debugging
  console.log(`Fetched ${staffMembers.length} staff members`)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StaffHeader />
      <div className="mt-8">
        <StaffTable staffMembers={staffMembers} />
      </div>
    </div>
  )
}
