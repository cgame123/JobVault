"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function DemoLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple demo password - you can change this to anything you want
    if (password === "jobvault-demo") {
      // Store a demo token in localStorage
      localStorage.setItem("demo-auth", "true")

      // Redirect to dashboard
      router.push("/")
    } else {
      setError("Invalid demo password")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-zinc-900 text-white border-zinc-800">
        <CardHeader className="space-y-1 items-center text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4">
            <Receipt className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Demo Login</CardTitle>
          <CardDescription className="text-zinc-400">Use the demo password to access JobVault</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Demo password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-zinc-500 text-xs">Demo password: jobvault-demo</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
