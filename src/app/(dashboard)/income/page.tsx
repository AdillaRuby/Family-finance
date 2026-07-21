import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getTransactions } from "@/features/transactions/services"
import { TransactionList } from "@/features/transactions/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/format"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export default async function IncomePage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  // Get all income transactions
  const allIncome = await getTransactions(user.familyId, { type: "INCOME" }, 100)

  // Calculate current month
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisMonthIncome = allIncome.filter(
    (t) => t.date >= monthStart && t.date <= monthEnd
  )

  // Calculate last month
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const lastMonthIncome = allIncome.filter(
    (t) => t.date >= lastMonthStart && t.date <= lastMonthEnd
  )

  const totalThisMonth = thisMonthIncome.reduce((sum, t) => sum + t.amount, 0)
  const totalLastMonth = lastMonthIncome.reduce((sum, t) => sum + t.amount, 0)

  // Calculate growth
  const growth =
    totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0

  // Group by category
  const categoryBreakdown = thisMonthIncome.reduce(
    (acc, t) => {
      const categoryName = t.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = { total: 0, count: 0, color: t.category.color }
      }
      acc[categoryName].total += t.amount
      acc[categoryName].count += 1
      return acc
    },
    {} as Record<string, { total: number; count: number; color: string | null }>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pemasukan</h1>
          <p className="text-muted-foreground mt-1">Kelola dan analisis sumber pemasukan</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemasukan
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bulan Ini</CardDescription>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">
              {formatCurrency(totalThisMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {thisMonthIncome.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bulan Lalu</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalLastMonth)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {lastMonthIncome.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pertumbuhan</CardDescription>
            <CardTitle
              className={`text-2xl flex items-center gap-2 ${
                growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {growth >= 0 ? "Naik" : "Turun"} dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Kategori</CardTitle>
            <CardDescription>Pemasukan bulan ini berdasarkan kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryBreakdown)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([category, data]) => {
                  const percentage = (data.total / totalThisMonth) * 100
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: data.color || "#6b7280" }}
                          />
                          <span className="font-medium">{category}</span>
                          <span className="text-muted-foreground">({data.count})</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(data.total)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: data.color || "#6b7280",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction List */}
      <TransactionList transactions={allIncome} />
    </div>
  )
}
