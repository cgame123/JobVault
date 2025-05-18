"use client"

// This is a simplified version of the use-toast hook
import { useState } from "react"

type ToastVariant = "default" | "destructive"

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    // In a real implementation, this would show a toast notification
    // For now, we'll just log to the console
    console.log(`Toast: ${props.title} - ${props.description || ""}`)

    // Add the toast to the state
    setToasts((prev) => [...prev, props])

    // Remove the toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== props))
    }, 3000)
  }

  return { toast, toasts }
}
