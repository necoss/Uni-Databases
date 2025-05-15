import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  if (!date) return "-"

  try {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return String(date)
  }
}

export function formatDateTime(date: string | Date): string {
  if (!date) return "-"

  try {
    return new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting date time:", error)
    return String(date)
  }
}

export function formatTime(date: string | Date): string {
  if (!date) return "-"

  try {
    return new Date(date).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error formatting time:", error)
    return String(date)
  }
}

export function calculateWorkHours(checkIn: string, checkOut: string | null): number {
  if (!checkOut || !checkIn) return 0

  try {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    return Math.round(diffHours * 10) / 10
  } catch (error) {
    console.error("Error calculating work hours:", error)
    return 0
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical":
      return "text-red-500"
    case "high":
      return "text-orange-500"
    case "medium":
      return "text-yellow-500"
    case "low":
      return "text-green-500"
    default:
      return ""
  }
}

export function getStatusColor(status: boolean): string {
  return status ? "text-green-500" : "text-red-500"
}

export function getStatusText(status: boolean): string {
  return status ? "Выполнено" : "В процессе"
}
