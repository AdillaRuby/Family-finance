/**
 * Format utilities for displaying data
 */

/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: showSymbol ? "currency" : "decimal",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  // Replace "Rp" with "Rp " for better spacing
  return formatted.replace("Rp", "Rp ")
}

/**
 * Format large numbers with K/M/B suffix
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Format date in Indonesian locale
 */
export function formatDate(date: Date, format: "short" | "long" | "relative" = "short"): string {
  if (format === "relative") {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 7) {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date)
    }
    if (diffDays > 0) return `${diffDays} hari lalu`
    if (diffHours > 0) return `${diffHours} jam lalu`
    if (diffMins > 0) return `${diffMins} menit lalu`
    return "Baru saja"
  }

  if (format === "long") {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}
