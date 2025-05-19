"use client"

import { useEffect, useRef, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface PropertyMetricsChartProps {
  data: Record<string, number>
  propertyDetails?: Record<
    string,
    {
      count: number
      lastTransaction: string
      changePercentage: string
      receipts: any[]
    }
  >
}

export function PropertyMetricsChart({ data, propertyDetails = {} }: PropertyMetricsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const router = useRouter()

  // Function to handle property click for filtering
  const handlePropertyClick = (property: string) => {
    // Navigate to receipts page with property filter
    router.push(`/receipts?property=${encodeURIComponent(property)}`)
  }

  useEffect(() => {
    if (!chartRef.current) return

    // Clear any existing content
    chartRef.current.innerHTML = ""

    // Get properties and values
    const properties = Object.keys(data)
    const values = Object.values(data)
    const total = values.reduce((sum, value) => sum + value, 0)

    // If no data, show a message
    if (properties.length === 0) {
      const message = document.createElement("div")
      message.className = "flex h-full items-center justify-center text-zinc-400"
      message.textContent = "No property data available. Add receipts with property information to see the chart."
      chartRef.current.appendChild(message)
      return
    }

    // Create a simple bar chart
    const chartContainer = document.createElement("div")
    chartContainer.className = "flex h-full flex-col justify-end space-y-2"

    // Calculate the maximum value for scaling
    const maxValue = Math.max(...values)

    // Create bars for each property
    properties.forEach((property, index) => {
      const value = data[property]
      const percentage = (value / maxValue) * 100
      const barHeight = Math.max(percentage, 3) // Minimum height for visibility

      // Create bar container
      const barContainer = document.createElement("div")
      barContainer.className = "flex flex-col space-y-1"

      // Create the bar
      const bar = document.createElement("div")
      bar.className =
        "relative h-8 w-full overflow-hidden rounded bg-zinc-800 cursor-pointer transition-all hover:brightness-110"
      bar.setAttribute("data-property", property)

      // Add click event listener
      bar.addEventListener("click", () => {
        handlePropertyClick(property)
      })

      // Add mouseover event listener for tooltip
      bar.addEventListener("mouseover", (e) => {
        // Set active tooltip
        setActiveTooltip(property)

        // Position tooltip near the cursor
        const tooltip = document.getElementById(`tooltip-${property}`)
        if (tooltip) {
          const rect = bar.getBoundingClientRect()
          tooltip.style.top = `${rect.top - 120}px`
          tooltip.style.left = `${rect.left + rect.width / 2}px`
        }
      })

      // Add mouseout event listener to hide tooltip
      bar.addEventListener("mouseout", () => {
        setActiveTooltip(null)
      })

      // Create the bar fill with neutral colors
      const barFill = document.createElement("div")

      // Use more neutral, monochromatic colors
      const colors = [
        "bg-zinc-400",
        "bg-zinc-500",
        "bg-zinc-600",
        "bg-zinc-700",
        "bg-zinc-500/80",
        "bg-zinc-600/80",
        "bg-zinc-400/90",
        "bg-zinc-500/90",
      ]

      barFill.className = `absolute inset-y-0 left-0 ${colors[index % colors.length]}`
      barFill.style.width = `${percentage}%`

      // Create the label
      const label = document.createElement("div")
      label.className = "absolute inset-y-0 left-2 flex items-center text-xs font-medium text-zinc-100"
      label.textContent = property

      // Create the value
      const valueElement = document.createElement("div")
      valueElement.className = "absolute inset-y-0 right-2 flex items-center text-xs font-medium text-zinc-100"
      valueElement.textContent = formatCurrency(value)

      // Assemble the bar
      bar.appendChild(barFill)
      bar.appendChild(label)
      bar.appendChild(valueElement)

      // Add the bar to the container
      barContainer.appendChild(bar)

      // Add percentage of total
      const percentOfTotal = document.createElement("div")
      percentOfTotal.className = "text-xs text-zinc-500"
      percentOfTotal.textContent = `${((value / total) * 100).toFixed(1)}% of total`
      barContainer.appendChild(percentOfTotal)

      // Add the bar container to the chart
      chartContainer.appendChild(barContainer)
    })

    // Add the chart to the container
    chartRef.current.appendChild(chartContainer)
  }, [data])

  // If no data, show a message
  if (Object.keys(data).length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <p>No property data available. Add receipts with property information to see the chart.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={chartRef} className="h-full w-full" />

      {/* Tooltips */}
      {Object.keys(data).map((property) => {
        const details = propertyDetails[property] || {
          count: 0,
          lastTransaction: "N/A",
          changePercentage: "0",
        }

        const isPositiveChange = Number.parseFloat(details.changePercentage) >= 0

        return (
          <div
            key={`tooltip-${property}`}
            id={`tooltip-${property}`}
            className={`absolute z-10 transform -translate-x-1/2 -translate-y-full bg-zinc-800 text-zinc-100 p-3 rounded shadow-lg transition-opacity duration-200 pointer-events-none ${
              activeTooltip === property ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="text-sm font-medium mb-1">{property}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-zinc-400">Number of receipts:</div>
              <div>{details.count}</div>

              <div className="text-zinc-400">Last transaction:</div>
              <div>{details.lastTransaction}</div>

              <div className="text-zinc-400">Change from last period:</div>
              <div className={isPositiveChange ? "text-green-400" : "text-red-400"}>
                {isPositiveChange ? "+" : ""}
                {details.changePercentage}%
              </div>
            </div>
            <div className="text-xs mt-2 text-zinc-400">Click to filter receipts</div>

            {/* Tooltip arrow */}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-zinc-800"></div>
          </div>
        )
      })}
    </div>
  )
}
