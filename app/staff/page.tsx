import { StaffHeader } from "@/components/staff-header"
import { StaffTable } from "@/components/staff-table"
import { getStaffMembers } from "@/lib/data"

export default async function StaffPage() {
  const staffMembers = await getStaffMembers()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StaffHeader />
      <div className="mt-8">
        <StaffTable staffMembers={staffMembers} />
      </div>
    </div>
  )
}
