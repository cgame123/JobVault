"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, ExternalLink, MapPin, User } from "lucide-react"
import { ReceiptActions } from "@/components/receipt-actions"

// Disable caching for this route
export const dynamic = "force-dynamic"
export const revalidate = 0

// Function to get a receipt by ID
async function getReceiptById(id: string) {
  const { data, error } = await supabase
    .from("receipts")
    .select(`
      *,
      staff:staff_id (
        name,
        phone_number,
        role,
        property
      )
    `)
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Error fetching receipt:", error)
    return null
  }

  return {
    id: data.id,
    vendor: data.vendor,
    amount: Number(data.amount),
    date: data.date,
    phoneNumber: data.phone_number,
    staffId: data.staff_id,
    staffName: data.staff?.name || data.staff_name,
    staffPhone: data.staff?.phone_number,
    staffRole: data.staff?.role,
    property: data.staff?.property,
    imageUrl: data.image_url,
    createdAt: data.created_at,
  }
}

// Function to create a proxy URL for Twilio images
function getProxyImageUrl(originalUrl: string, download = false) {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}${download ? "&download=true" : ""}`
}

export default async function ReceiptDetailsPage({ params }: { params: { id: string } }) {
  const receipt = await getReceiptById(params.id)

  if (!receipt) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline" size="sm" className="text-zinc-400 hover:text-zinc-100">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <ReceiptActions receipt={receipt} />
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
                src={getProxyImageUrl(receipt.imageUrl) || "/placeholder.svg"}
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
              onClick={() => window.open(getProxyImageUrl(receipt.imageUrl), "_blank")}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Size
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getProxyImageUrl(receipt.imageUrl, true), "_blank")}
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
