import { cn } from "@/lib/utils"

type StatusType = "submitted" | "processing" | "needs_review" | "approved" | "rejected" | "duplicate"

interface StatusBadgeProps {
  status?: StatusType
  className?: string
}

export function StatusBadge({ status = "submitted", className }: StatusBadgeProps) {
  const statusConfig = {
    submitted: {
      label: "Submitted",
      className: "bg-zinc-700/50 text-zinc-300",
    },
    processing: {
      label: "Processing",
      className: "bg-blue-900/30 text-blue-300",
    },
    needs_review: {
      label: "Needs Review",
      className: "bg-amber-900/30 text-amber-300",
    },
    approved: {
      label: "Approved",
      className: "bg-green-900/30 text-green-300",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-900/30 text-red-300",
    },
    duplicate: {
      label: "Duplicate",
      className: "bg-purple-900/30 text-purple-300",
    },
  }

  // Handle case where status might be undefined or not in our config
  const config = statusConfig[status] || statusConfig.submitted

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

interface PaymentBadgeProps {
  paid?: boolean
  className?: string
}

export function PaymentBadge({ paid = false, className }: PaymentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        paid ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300",
        className,
      )}
    >
      {paid ? "Yes" : "No"}
    </span>
  )
}
