"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transaksi",
  income: "Pemasukan",
  expenses: "Pengeluaran",
  budgets: "Anggaran",
  savings: "Tabungan",
  bills: "Tagihan",
  reports: "Laporan",
  family: "Keluarga",
  settings: "Pengaturan",
  notifications: "Notifikasi",
  "net-worth": "Kekayaan Bersih",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dashboard"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const label = routeLabels[segment] || segment
          const isLast = index === segments.length - 1

          return (
            <li key={href} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
