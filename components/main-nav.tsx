"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Receipt } from "lucide-react"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Receipts",
    href: "/receipts",
    icon: Receipt,
  },
  {
    name: "Staff",
    href: "/staff",
    icon: Users,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <div className="flex items-center">
            <span className="text-lg font-medium mr-2">Job</span>
            <span className="text-lg font-medium bg-zinc-800 px-2 py-0.5 rounded">Vault</span>
          </div>
        </Link>
        <div className="flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-zinc-100",
                pathname === item.href ? "text-zinc-100" : "text-zinc-400",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
