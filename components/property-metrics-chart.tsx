"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  const router = useRouter()
  const [activeBar, setActiveBar] = useState<string | null>(null)

  // Function to handle property click for filtering
  const handlePropertyClick = (property: string) => {
    // Navigate to receipts page with property filter
    router.push(`/receipts?property=${encodeURIComponent(property)}`)
  }

  // Transform data for Recharts
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1]) // Sort by highest spend
    .map(([property, value]) => {
      const details = propertyDetails[property] || {
        count: 0,
        lastTransaction: "N/A",
        changePercentage: "0",
      }

      const total = Object.values(data).reduce((sum, val) => sum + val, 0)
      const percentage = ((value / total) * 100).toFixed(1)

      return {
        property,
        value,
        count: details.count,
        lastTransaction: details.lastTransaction,
        percentage,
      }
    })

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        <p>No property data available. Add receipts with property information to see the chart.</p>
      </div>
    )
  }

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-zinc-800 text-zinc-100 p-3 rounded shadow-lg">
          <div className="text-sm font-medium mb-1">{data.property}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="text-zinc-400">Total spend:</div>
            <div>{formatCurrency(data.value)}</div>

            <div className="text-zinc-400">Percentage of total:</div>
            <div>{data.percentage}%</div>

            <div className="text-zinc-400">Number of receipts:</div>
            <div>{data.count}</div>

            <div className="text-zinc-400">Last transaction:</div>
            <div>{data.lastTransaction}</div>
          </div>
          <div className="text-xs mt-2 text-zinc-400">Click to filter receipts</div>
        </div>
      )
    }
    return null
  }

  // Custom label for bars
  const renderCustomBarLabel = ({ x, y, width, value }: any) => {
    return (
      <text x={x + width / 2} y={y - 10} fill="#f1f5f9" textAnchor="middle" dominantBaseline="middle" fontSize={12}>
        {formatCurrency(value)}
      </text>
    )
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 70 }} barSize={60}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="property" angle={-45} textAnchor="end" height={70} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            fill="#3b82f6"
            label={renderCustomBarLabel}
            onClick={(data) => handlePropertyClick(data.property)}
            onMouseOver={() => setActiveBar(activeBar)}
            onMouseOut={() => setActiveBar(null)}
            className="cursor-pointer hover:opacity-80"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
