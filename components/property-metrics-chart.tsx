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

    // Get properties and values, then sort by value in descending order
    const propertyEntries = Object.entries(data).sort((a, b) => b[1] - a[1])
    const properties = propertyEntries.map(([property]) => property)
    const values = propertyEntries.map(([, value]) => value)
    const total = values.reduce((sum, value) => sum + value, 0)

    // If no data, show a message
    if (properties.length === 0) {
      const message = document.createElement("div")
      message.className = "flex h-full items-center justify-center text-zinc-400"
      message.textContent = "No property data available. Add receipts with property information to see the chart."
      chartRef.current.appendChild(message)
      return
    }

    // Log data for debugging
    console.log("Chart data:", propertyEntries)

    // Create a vertical column chart
    const chartContainer = document.createElement("div")
    chartContainer.className = "flex h-full flex-col"

    // Calculate the maximum value for scaling
    const maxValue = Math.max(...values)
    console.log("Max value:", maxValue)

    // Create chart area with y-axis and bars
    const chartArea = document.createElement("div")
    chartArea.className = "flex flex-1 mt-8 mb-4"
    chartArea.style.height = "300px" // Explicit height

    // Create y-axis
    const yAxis = document.createElement("div")
    yAxis.className = "flex flex-col justify-between pr-2 text-xs text-zinc-400"

    // Add y-axis labels (5 steps)
    const steps = 5
    for (let i = steps; i >= 0; i--) {
      const value = (maxValue * i) / steps
      const label = document.createElement("div")
      label.className = "text-right"
      label.textContent = formatCurrency(value)
      yAxis.appendChild(label)
    }
    chartArea.appendChild(yAxis)

    // Create bars container with grid lines
    const barsContainer = document.createElement("div")
    barsContainer.className = "relative flex-1 flex items-end"

    // Add horizontal grid lines
    for (let i = 0; i <= steps; i++) {
      const gridLine = document.createElement("div")
      gridLine.className = "absolute w-full border-t border-zinc-800"
      gridLine.style.bottom = `${(i / steps) * 100}%`
      barsContainer.appendChild(gridLine)
    }

    // Create bars wrapper (horizontal flex)
    const barsWrapper = document.createElement("div")
    barsWrapper.className = "flex justify-between items-end w-full h-full"

    // Create bars for each property
    propertyEntries.forEach(([property, value], index) => {
      const percentage = (value / maxValue) * 100
      console.log(`Bar ${property}: ${value} (${percentage}%)`)

      // Create bar container
      const barContainer = document.createElement("div")
      barContainer.className = "flex flex-col items-center"
      barContainer.style.width = `${100 / propertyEntries.length}%`
      barContainer.style.maxWidth = "100px"
      barContainer.style.minWidth = "60px"

      // Create the bar
      const barOuter = document.createElement("div")
      barOuter.className = "relative w-full px-1 h-full flex items-end"

      const bar = document.createElement("div")
      bar.className = "w-full cursor-pointer transition-all hover:brightness-110 bg-blue-500 rounded-t"

      // Ensure minimum height for visibility and calculate height based on percentage
      const barHeightPercent = Math.max(percentage, 1)
      bar.style.height = `${barHeightPercent}%`

      console.log(`Setting bar height to ${barHeightPercent}%`)

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

      // Add value label on top of bar
      const valueLabel = document.createElement("div")
      valueLabel.className = "absolute -top-6 left-0 right-0 text-center text-xs font-medium text-zinc-100"
      valueLabel.textContent = formatCurrency(value)

      barOuter.appendChild(bar)
      barOuter.appendChild(valueLabel)
      barContainer.appendChild(barOuter)

      barsWrapper.appendChild(barContainer)
    })

    barsContainer.appendChild(barsWrapper)
    chartArea.appendChild(barsContainer)
    chartContainer.appendChild(chartArea)

    // Create x-axis
    const xAxis = document.createElement("div")
    xAxis.className = "flex justify-between px-1"

    // Add x-axis labels
    propertyEntries.forEach(([property]) => {
      const label = document.createElement("div")
      label.className = "text-xs text-zinc-400 text-center truncate px-1"
      label.style.width = `${100 / propertyEntries.length}%`
      label.style.maxWidth = "100px"
      label.style.minWidth = "60px"
      label.title = property // Show full name on hover
      label.textContent = property
      xAxis.appendChild(label)
    })

    chartContainer.appendChild(xAxis)

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
    <div className="relative h-[400px]">
      <div ref={chartRef} className="h-full w-full" />

      {/* Tooltips */}
      {Object.keys(data).map((property) => {
        const details = propertyDetails[property] || {
          count: 0,
          lastTransaction: "N/A",
          changePercentage: "0",
        }

        const isPositiveChange = Number.parseFloat(details.changePercentage) >= 0
        const propertyValue = data[property]
        const total = Object.values(data).reduce((sum, value) => sum + value, 0)
        const percentage = ((propertyValue / total) * 100).toFixed(1)

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
              <div className="text-zinc-400">Total spend:</div>
              <div>{formatCurrency(propertyValue)}</div>

              <div className="text-zinc-400">Percentage of total:</div>
              <div>{percentage}%</div>

              <div className="text-zinc-400">Number of receipts:</div>
              <div>{details.count}</div>

              <div className="text-zinc-400">Last transaction:</div>
              <div>{details.lastTransaction}</div>
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
