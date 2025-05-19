import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { PropertyMetricsChart } from "@/components/property-metrics-chart"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { ActivityFeed } from "@/components/activity-feed"
import { RefreshButton } from "@/components/refresh-button"
import type { Receipt } from "@/lib/types"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to fetch receipts from Supabase with staff information
async function getReceipts(): Promise<Receipt[]> {
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

// Function to process receipts into property metrics
function processReceiptsForMetrics(receipts: Receipt[]) {
  // Process data to get metrics by property
  const propertyMap = new Map()
  const propertyDetails = {}

  // Calculate 30 days ago for recent receipts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Track receipts in the last 30 days
  let recentReceiptsCount = 0

  receipts.forEach((receipt) => {
    const property = receipt.property || "Unassigned"
    const amount = receipt.amount
    const receiptDate = new Date(receipt.date)
    const createdAt = new Date(receipt.createdAt)

    // Check if receipt is from last 30 days
    if (receiptDate >= thirtyDaysAgo) {
      recentReceiptsCount++
    }

    // Add to property map
    if (!propertyMap.has(property)) {
      propertyMap.set(property, {
        name: property,
        total: 0,
        count: 0,
        lastTransaction: new Date(0),
        receipts: [],
      })
    }

    const propertyData = propertyMap.get(property)
    propertyData.total += amount
    propertyData.count += 1

    // Update last transaction date if this receipt is newer
    if (createdAt > propertyData.lastTransaction) {
      propertyData.lastTransaction = createdAt
    }

    // Add receipt to property's receipts array
    propertyData.receipts.push({
      id: receipt.id,
      vendor: receipt.vendor,
      amount: amount,
      date: receipt.date,
    })

    propertyMap.set(property, propertyData)
  })

  // Convert map to array and sort by total
  const properties = Array.from(propertyMap.values()).sort((a, b) => b.total - a.total)

  // Create total by property object for chart
  const totalByProperty = {}

  // Create property details object for tooltips and filtering
  properties.forEach((property) => {
    totalByProperty[property.name] = property.total

    // Calculate previous period for comparison (assuming previous 30 days)
    // For demo purposes, we'll generate a random change percentage
    const changePercentage = Math.random() * 40 - 20 // Random value between -20% and +20%

    propertyDetails[property.name] = {
      count: property.count,
      lastTransaction: property.lastTransaction.toISOString().split("T")[0],
      changePercentage: changePercentage.toFixed(1),
      receipts: property.receipts,
    }
  })

  return {
    properties,
    totalByProperty,
    propertyDetails,
    recentReceiptsCount,
  }
}

export default async function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
          <p className="text-zinc-400">Track expenses across all properties and monitor spending trends.</p>
        </div>
        <RefreshButton />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  // Fetch real receipts from Supabase
  const receipts = await getReceipts()

  // Process receipts into metrics
  const { properties, totalByProperty, propertyDetails, recentReceiptsCount } = processReceiptsForMetrics(receipts)

  // Calculate total across all properties
  const totalExpenses = properties.reduce((sum, property) => sum + property.total, 0)

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses (All Properties)</CardTitle>
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
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-zinc-500">Across {properties.length} properties</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Receipts Processed (Last 30 Days)</CardTitle>
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
            <div className="text-2xl font-bold text-zinc-100">{recentReceiptsCount}</div>
            <p className="text-xs text-zinc-500">
              Out of {properties.reduce((sum, property) => sum + property.count, 0)} total receipts
            </p>
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
            <div className="text-2xl font-bold text-zinc-100">
              {process.env.TWILIO_PHONE_NUMBER || "+1 (888) 639-5525"}
            </div>
            <p className="text-xs text-zinc-500">Text your receipts to this number</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="border-zinc-800 bg-zinc-900/50 shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-100">Expenses by Property</h2>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <PropertyMetricsChart data={totalByProperty} propertyDetails={propertyDetails} />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Suspense fallback={<div className="h-[400px] animate-pulse rounded-lg bg-zinc-800/50" />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
