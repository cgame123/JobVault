export interface Receipt {
  id: string
  vendor: string
  amount: number
  date: string
  phoneNumber: string
  staffId?: string
  staffName?: string
  property?: string
  imageUrl: string
  createdAt: string
}

export interface StaffMember {
  id: string
  name: string
  phoneNumber: string
  role: string
  property?: string
  createdAt: string
}
