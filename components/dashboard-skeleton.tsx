import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-zinc-800 bg-zinc-900/50 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-zinc-800" />
              <Skeleton className="h-4 w-4 rounded-full bg-zinc-800" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-6 w-28 bg-zinc-800" />
              <Skeleton className="h-3 w-20 bg-zinc-800" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-zinc-800" />
          <Skeleton className="h-4 w-64 bg-zinc-800" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full bg-zinc-800" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
