import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow as distanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date"
  }
}

export function formatDistanceToNow(date: Date | string): string {
  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date

    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      return "Invalid date"
    }

    return distanceToNow(parsedDate, { addSuffix: true })
  } catch (error) {
    console.error("Error formatting distance to now:", error)
    return "Invalid date"
  }
}
