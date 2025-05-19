"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, ExternalLink, MapPin, User } from "lucide-react"
import { ReceiptActions } from "@/components/receipt-actions"

interface Receipt {
  id: string
  vendor: string
  amount: number
  date: string
  phoneNumber: string
  staffId: string
  staffName: string
  staffPhone: string
  staffRole: string
  property: string
  imageUrl: string
  createdAt: string
  status: string
  paid: boolean
}

export default function ReceiptDetailsPage({ params }: { params: { id: string } }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadReceipt() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/receipts/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch receipt")
        }

        const data = await response.json()
        setReceipt(data)
      } catch (err) {
        console.error("Error in loadReceipt:", err)
        setError("An error occurred while loading the receipt. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadReceipt()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-zinc-100"></div>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="text-zinc-400 hover:text-zinc-100">
            <Link href="/receipts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Receipts
            </Link>
          </Button>
        </div>
        <Card className="border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">{error || "Receipt not found or an error occurred."}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.refresh()} className="text-zinc-400 hover:text-zinc-100">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="text-zinc-400 hover:text-zinc-100">
          <Link href="/receipts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Link>
        </Button>
        <div className="flex gap-2">
          <ReceiptActions receipt={receipt} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left column - Receipt image */}
        <Card className="md:col-span-2 border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle>Receipt Image</CardTitle>
            <CardDescription className="text-zinc-400">Original receipt from {receipt.vendor}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-800">
              <Image
                src={receipt.imageUrl || "/placeholder.svg"}
                alt={`Receipt from ${receipt.vendor}`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(receipt.imageUrl, "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(receipt.imageUrl, "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </CardFooter>
        </Card>

        {/* Right column - Receipt details */}
        <Card className="md:col-span-3 border-zinc-800 bg-zinc-900/50 shadow-lg">
          <CardHeader>
            <CardTitle>Receipt Details</CardTitle>
            <CardDescription className="text-zinc-400">Submitted on {formatDate(receipt.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic receipt info */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-zinc-100">{receipt.vendor}</h3>
                <span className="text-lg font-bold text-zinc-100">{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="text-sm text-zinc-400">Purchase Date: {formatDate(receipt.date)}</div>
            </div>

            {/* Status and Payment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">Status</h3>
                <div className="text-sm text-zinc-300">{receipt.status}</div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-zinc-400">Payment</h3>
                <div className="text-sm text-zinc-300">{receipt.paid ? "Paid" : "Pending"}</div>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Staff information */}
            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-zinc-400">
                <User className="mr-2 h-4 w-4" />
                Staff Information
              </h3>
              <div className="rounded-md bg-zinc-800/50 p-3">
                <div className="mb-1 text-sm font-medium text-zinc-100">{receipt.staffName || "Unknown Staff"}</div>
                {receipt.staffRole && <div className="text-xs text-zinc-400">Role: {receipt.staffRole}</div>}
                {receipt.staffPhone && <div className="text-xs text-zinc-400">Phone: {receipt.staffPhone}</div>}
              </div>
            </div>

            {/* Property information */}
            <div className="space-y-3">
              <h3 className="flex items-center text-sm font-medium text-zinc-400">
                <MapPin className="mr-2 h-4 w-4" />
                Property
              </h3>
              <div className="rounded-md bg-zinc-800/50 p-3">
                <div className="text-sm font-medium text-zinc-100">{receipt.property || "Unassigned"}</div>
              </div>
            </div>

            {/* Technical details */}
            <Separator className="bg-zinc-800" />
            <div className="space-y-2 text-xs text-zinc-500">
              <div>Receipt ID: {receipt.id}</div>
              <div>Submitted via: SMS to {receipt.phoneNumber}</div>
              <div>Processed on: {new Date(receipt.createdAt).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
