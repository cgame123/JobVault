import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Download } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="text-zinc-400">Every charge. Every property. Accounted for.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search receipts..."
            className="w-full rounded-md border-zinc-800 bg-zinc-900/50 pl-8 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-zinc-700 md:w-[200px] lg:w-[300px]"
          />
        </div>
        <Button
          asChild
          variant="outline"
          className="border-zinc-800 bg-zinc-900/50 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Link href="/staff">
            <Users className="mr-2 h-4 w-4" />
            Staff
          </Link>
        </Button>
        <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
