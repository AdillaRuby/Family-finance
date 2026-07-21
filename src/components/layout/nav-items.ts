import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  FileText,
  Users,
  Settings,
  Bell,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Transaksi", href: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { title: "Pemasukan", href: "/income", icon: TrendingUp },
      { title: "Pengeluaran", href: "/expenses", icon: TrendingDown },
      { title: "Anggaran", href: "/budgets", icon: PiggyBank },
      { title: "Tabungan", href: "/savings", icon: Target },
      { title: "Tagihan", href: "/bills", icon: FileText },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { title: "Laporan", href: "/reports", icon: BarChart3 },
      { title: "Keluarga", href: "/family", icon: Users },
      { title: "Notifikasi", href: "/notifications", icon: Bell },
      { title: "Pengaturan", href: "/settings", icon: Settings },
    ],
  },
]
