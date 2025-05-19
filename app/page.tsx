import { DashboardHeader } from "@/components/dashboard-header"
import { ReceiptTable } from "@/components/receipt-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { Receipt } from "@/lib/types"
import { RefreshButton } from "@/components/refresh-button"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to fetch receipts from Supabase with staff information
async function getReceipts(): Promise<Receipt[]> {
  // Join receipts with staff to get property information
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      *,
      staff:staff_id (
        name,
        property
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching receipts:", error)
    return []
  }

  return data.map((row) => ({
    id: row.id,
    vendor: row.vendor,
    amount: Number(row.amount),
    date: row.date,
    phoneNumber: row.phone_number,
    staffId: row.staff_id,
    staffName: row.staff_name || (row.staff ? row.staff.name : null),
    property: row.staff ? row.staff.property : null,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  }))
}

export default async function DashboardPage() {
  // Fetch real receipts from Supabase
  const receipts = await getReceipts()

  // Calculate total amount
  const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.amount, 0)

  // Get count of receipts in the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentReceipts = receipts.filter((receipt) => new Date(receipt.date) >= thirtyDaysAgo).length

  // Get your Twilio phone number from environment variable
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1 (888) 639-5525"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardHeader />

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-500"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-zinc-500">Across {receipts.length} receipts</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Receipts</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-500"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{recentReceipts}</div>
            <p className="text-xs text-zinc-500">In the last 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">SMS Number</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-500"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{twilioPhoneNumber}</div>
            <p className="text-xs text-zinc-500">Text your receipts to this number</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="bg-zinc-900/50">
                <TabsTrigger value="all">All Receipts</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <RefreshButton />
            </div>

            <TabsContent value="all" className="mt-4">
              <ReceiptTable receipts={receipts} />
            </TabsContent>
            <TabsContent value="recent" className="mt-4">
              <ReceiptTable receipts={receipts.filter((receipt) => new Date(receipt.date) >= thirtyDaysAgo)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
