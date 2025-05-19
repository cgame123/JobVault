"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, X } from "lucide-react"

export function BottomBanner() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="relative w-full bg-white py-6 shadow-lg">
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute right-4 top-4 text-gray-500 hover:text-black md:right-6"
        aria-label="Close banner"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left side with text */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold tracking-tight text-black md:text-2xl">
              Stop Chasing Receipts — Start Controlling Spend.
            </h3>
            <p className="mt-1 text-sm font-medium text-gray-700 md:text-base">
              Property-linked cards + 2% cashback = less admin, more visibility.
            </p>
          </div>

          {/* Right side with button */}
          <div className="flex-shrink-0">
            <Button
              className="bg-black text-white hover:bg-gray-800 transition-all duration-200 transform hover:translate-x-1"
              size="lg"
            >
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      </div>
    </div>
  )
}
