import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDistanceToNow } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"

interface ActivityItem {
  id: string
  type: "receipt_created"
  staffName: string
  vendor: string
  amount: number
  property?: string
  timestamp: string
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  // Fetch recent receipts with staff information
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      id,
      vendor,
      amount,
      created_at,
      staff_name,
      staff:staff_id (
        name,
        property
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching recent activity:", error)
    return []
  }

  return data.map((item) => ({
    id: item.id,
    type: "receipt_created",
    staffName: item.staff_name || (item.staff ? item.staff.name : "Unknown"),
    vendor: item.vendor,
    amount: Number(item.amount),
    property: item.staff?.property,
    timestamp: item.created_at,
  }))
}

export async function ActivityFeed() {
  const activities = await getRecentActivity()

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-6 text-zinc-500">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-zinc-800 p-1.5">
                  <Receipt className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-200">
                    <span className="font-medium">{activity.staffName}</span> submitted a receipt for{" "}
                    <span className="font-medium">{formatCurrency(activity.amount)}</span> at{" "}
                    <span className="font-medium">{activity.vendor}</span>
                    {activity.property && (
                      <>
                        {" "}
                        for <span className="font-medium">{activity.property}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(activity.timestamp))}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
