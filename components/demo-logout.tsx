"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

export function DemoLogout() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear demo auth from localStorage and cookies
    localStorage.removeItem("demo-auth")
    Cookies.remove("demo-auth")

    // Redirect to login
    router.push("/demo-login")
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-zinc-400 hover:text-white">
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
