"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Receipt, Users, User, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const { user, signOut, isConfigured } = useAuth()

  return (
    <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-800 p-1">
            <Receipt className="h-6 w-6 text-zinc-100" />
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

          {isConfigured ? (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-zinc-800 p-0 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100"
                  >
                    <span className="sr-only">Open user menu</span>
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-900 text-zinc-100">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    className="cursor-pointer text-zinc-400 focus:bg-zinc-800 focus:text-zinc-100"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                <Link href="/login">
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )
          ) : (
            <Button
              variant="ghost"
              className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => (window.location.href = "/login")}
            >
              <User className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
