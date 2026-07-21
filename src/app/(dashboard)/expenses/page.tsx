import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getTransactions } from "@/features/transactions/services"
import { TransactionList } from "@/features/transactions/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Plus, TrendingDown, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/format"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function ExpensesPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  // Get all expense transactions
  const allExpenses = await getTransactions(user.familyId, { type: "EXPENSE" }, 100)

  // Calculate current month
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisMonthExpenses = allExpenses.filter(
    (t) => t.date >= monthStart && t.date <= monthEnd
  )

  // Calculate last month
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const lastMonthExpenses = allExpenses.filter(
    (t) => t.date >= lastMonthStart && t.date <= lastMonthEnd
  )

  const totalThisMonth = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0)
  const totalLastMonth = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0)

  // Calculate average per day
  const daysInMonth = endOfMonth(now).getDate()
  const currentDay = now.getDate()
  const averagePerDay = currentDay > 0 ? totalThisMonth / currentDay : 0
  const projectedTotal = averagePerDay * daysInMonth

  // Calculate change
  const change =
    totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0

  // Group by category
  const categoryBreakdown = thisMonthExpenses.reduce(
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

  // Find top expense
  const topCategory = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b.total - a.total
  )[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengeluaran</h1>
          <p className="text-muted-foreground mt-1">Kelola dan analisis pengeluaran keluarga</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Link>
        </Button>
      </div>

      {/* Warning if expenses increased significantly */}
      {change > 20 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pengeluaran bulan ini naik {change.toFixed(0)}% dari bulan lalu. Pertimbangkan untuk
            mengurangi pengeluaran tidak penting.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bulan Ini</CardDescription>
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              {formatCurrency(totalThisMonth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {thisMonthExpenses.length} transaksi
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
              {lastMonthExpenses.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perubahan</CardDescription>
            <CardTitle
              className={`text-2xl flex items-center gap-2 ${
                change <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              <TrendingDown className="h-5 w-5" />
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {change <= 0 ? "Turun" : "Naik"} dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Proyeksi Akhir Bulan</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(projectedTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Rata-rata {formatCurrency(averagePerDay)}/hari
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Expense Alert */}
      {topCategory && (
        <Alert>
          <AlertDescription>
            Pengeluaran terbesar bulan ini: <strong>{topCategory[0]}</strong> (
            {formatCurrency(topCategory[1].total)} dari {topCategory[1].count} transaksi)
          </AlertDescription>
        </Alert>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Breakdown per Kategori</CardTitle>
            <CardDescription>Pengeluaran bulan ini berdasarkan kategori</CardDescription>
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
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(data.total)}</p>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
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
      <TransactionList transactions={allExpenses} />
    </div>
  )
}
