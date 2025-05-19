import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  // Determine color based on role
  const getColorClass = (role: string) => {
    const lowerRole = role.toLowerCase()

    if (lowerRole.includes("manager") || lowerRole.includes("pm")) {
      return "bg-blue-900/50 text-blue-300 border-blue-800"
    }

    if (lowerRole.includes("admin") || lowerRole.includes("director")) {
      return "bg-purple-900/50 text-purple-300 border-purple-800"
    }

    if (lowerRole.includes("maintenance") || lowerRole.includes("tech")) {
      return "bg-amber-900/50 text-amber-300 border-amber-800"
    }

    if (lowerRole.includes("leasing") || lowerRole.includes("agent")) {
      return "bg-green-900/50 text-green-300 border-green-800"
    }

    if (lowerRole.includes("assistant")) {
      return "bg-teal-900/50 text-teal-300 border-teal-800"
    }

    // Default color
    return "bg-zinc-800 text-zinc-300 border-zinc-700"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
        getColorClass(role),
        className,
      )}
    >
      {role}
    </span>
  )
}
