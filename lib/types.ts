export interface Receipt {
  id: string
  vendor: string
  amount: number
  date: string
  phoneNumber: string
  staffId?: string
  staffName?: string
  property?: string // This comes from the staff table, not stored in receipts
  imageUrl: string
  createdAt: string
  status: "Processing" | "Approved" | "Rejected" | "Duplicate"
  paid: boolean
}

export interface StaffMember {
  id: string
  name: string
  phoneNumber: string
  role: string
  property?: string
  createdAt: string
}
