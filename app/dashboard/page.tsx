import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { PropertyMetricsChart } from "@/components/property-metrics-chart"
import { PropertyTable } from "@/components/property-table"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { RefreshButton } from "@/components/refresh-button"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to fetch property metrics from Supabase
async function getPropertyMetrics() {
  // Get receipts with property information
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      amount,
      date,
      vendor,
      staff:staff_id (
        name,
        property
      )
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching property metrics:", error)
    return { properties: [], totalByProperty: {}, recentActivity: [] }
  }

  // Process data to get metrics by property
  const propertyMap = new Map()
  const recentActivity = []

  data.forEach((receipt) => {
    const property = receipt.staff?.property || "Unassigned"
    const amount = Number(receipt.amount)

    // Add to property map
    if (!propertyMap.has(property)) {
      propertyMap.set(property, {
        name: property,
        total: 0,
        count: 0,
      })
    }

    const propertyData = propertyMap.get(property)
    propertyData.total += amount
    propertyData.count += 1
    propertyMap.set(property, propertyData)

    // Add to recent activity (limit to 5)
    if (recentActivity.length < 5) {
      recentActivity.push({
        date: receipt.date,
        vendor: receipt.vendor,
        amount: amount,
        property: property,
      })
    }
  })

  // Convert map to array and sort by total
  const properties = Array.from(propertyMap.values()).sort((a, b) => b.total - a.total)

  // Create total by property object for chart
  const totalByProperty = {}
  properties.forEach((property) => {
    totalByProperty[property.name] = property.total
  })

  return { properties, totalByProperty, recentActivity }
}

export default async function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Property Dashboard</h1>
          <p className="text-zinc-400">Track expenses by property and monitor spending trends.</p>
        </div>
        <RefreshButton />
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <PropertyMetricsContent />
      </Suspense>
    </div>
  )
}

async function PropertyMetricsContent() {
  const { properties, totalByProperty, recentActivity } = await getPropertyMetrics()

  // Calculate total across all properties
  const totalExpenses = properties.reduce((sum, property) => sum + property.total, 0)

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold text-zinc-100">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-zinc-500">Across {properties.length} properties</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Highest Spending</CardTitle>
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
              <path d="m2 7 5 5-5 5" />
              <path d="m17 7 5 5-5 5" />
              <path d="M7 7h10" />
              <path d="M7 17h10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {properties.length > 0 ? properties[0].name : "None"}
            </div>
            <p className="text-xs text-zinc-500">
              {properties.length > 0 ? formatCurrency(properties[0].total) : "$0.00"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Average Per Property</CardTitle>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {properties.length > 0 ? formatCurrency(totalExpenses / properties.length) : "$0.00"}
            </div>
            <p className="text-xs text-zinc-500">Per property average</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Receipts</CardTitle>
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
            <div className="text-2xl font-bold text-zinc-100">
              {properties.reduce((sum, property) => sum + property.count, 0)}
            </div>
            <p className="text-xs text-zinc-500">Total receipts processed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="bg-zinc-900/50">
          <TabsTrigger value="chart">Chart View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
            <CardHeader>
              <CardTitle>Expenses by Property</CardTitle>
              <CardDescription className="text-zinc-400">
                Breakdown of total expenses across all properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <PropertyMetricsChart data={totalByProperty} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <PropertyTable properties={properties} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-zinc-400">
                The latest expense receipts across properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-100">{activity.vendor}</p>
                      <p className="text-xs text-zinc-400">{activity.property}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-100">{formatCurrency(activity.amount)}</p>
                        <p className="text-xs text-zinc-400">{new Date(activity.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="py-4 text-center text-zinc-400">No recent activity found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
