import type { Receipt, StaffMember } from "./types"

// This is mock data for demonstration purposes
// In a real application, this would fetch from a database
export async function getStaffMembers(): Promise<StaffMember[]> {
  return [
    {
      id: "1",
      name: "John Smith",
      phoneNumber: "+1 (555) 123-4567",
      role: "Property Manager",
      property: "Sunset Apartments",
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      phoneNumber: "+1 (555) 987-6543",
      role: "Maintenance Supervisor",
      property: "Oakwood Heights",
      createdAt: "2025-02-20T14:30:00Z",
    },
    {
      id: "3",
      name: "Michael Brown",
      phoneNumber: "+1 (555) 456-7890",
      role: "Field Technician",
      property: "Riverside Commons",
      createdAt: "2025-03-10T09:15:00Z",
    },
    {
      id: "4",
      name: "Emily Davis",
      phoneNumber: "+1 (555) 234-5678",
      role: "Property Manager",
      property: "Pine Valley Estates",
      createdAt: "2025-03-25T11:45:00Z",
    },
    {
      id: "5",
      name: "Robert Wilson",
      phoneNumber: "+1 (555) 876-5432",
      role: "Maintenance Technician",
      property: "Maple Grove Condos",
      createdAt: "2025-04-05T16:20:00Z",
    },
  ]
}

export async function getReceipts(): Promise<Receipt[]> {
  const staffMembers = await getStaffMembers()

  // Map phone numbers to staff names for easier lookup
  const staffMap = new Map(staffMembers.map((staff) => [staff.phoneNumber, staff]))

  const receipts = [
    {
      id: "1",
      vendor: "Home Depot",
      amount: 129.95,
      date: "2025-05-17",
      phoneNumber: "+1 (555) 123-4567",
      imageUrl: "/home-depot-receipt.png",
      createdAt: "2025-05-17T14:30:00Z",
    },
    {
      id: "2",
      vendor: "Lowe's",
      amount: 87.5,
      date: "2025-05-15",
      phoneNumber: "+1 (555) 987-6543",
      imageUrl: "/placeholder-627l1.png",
      createdAt: "2025-05-15T10:15:00Z",
    },
    {
      id: "3",
      vendor: "Ace Hardware",
      amount: 45.99,
      date: "2025-05-10",
      phoneNumber: "+1 (555) 456-7890",
      imageUrl: "/ace-hardware-receipt.png",
      createdAt: "2025-05-10T16:45:00Z",
    },
    {
      id: "4",
      vendor: "Walmart",
      amount: 215.67,
      date: "2025-05-05",
      phoneNumber: "+1 (555) 234-5678",
      imageUrl: "/walmart-receipt.png",
      createdAt: "2025-05-05T09:20:00Z",
    },
    {
      id: "5",
      vendor: "Target",
      amount: 78.32,
      date: "2025-04-28",
      phoneNumber: "+1 (555) 876-5432",
      imageUrl: "/target-receipt.png",
      createdAt: "2025-04-28T13:10:00Z",
    },
  ]

  // Add staff information to receipts
  return receipts.map((receipt) => {
    const staff = staffMap.get(receipt.phoneNumber)
    return {
      ...receipt,
      staffId: staff?.id,
      staffName: staff?.name,
    }
  })
}
