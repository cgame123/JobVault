"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Briefcase, Home, Users } from "lucide-react"

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
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
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 p-1">
            <Briefcase className="h-5 w-5 text-zinc-100" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-100">JobVault</span>
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
