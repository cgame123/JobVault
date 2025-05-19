"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    // Only run this once
    if (!isChecked) {
      // Check if demo auth is in localStorage
      const isDemoAuth = localStorage.getItem("demo-auth") === "true"

      if (isDemoAuth) {
        // Set a cookie for the middleware to use
        Cookies.set("demo-auth", "true", { expires: 1 }) // Expires in 1 day
      } else if (pathname !== "/demo-login" && pathname !== "/login") {
        // If not authenticated and not on login page, redirect
        router.push("/demo-login")
      }

      setIsChecked(true)
    }
  }, [pathname, router, isChecked])

  return <>{children}</>
}
