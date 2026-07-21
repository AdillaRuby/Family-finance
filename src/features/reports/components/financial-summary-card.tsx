import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import type { FinancialSummary } from "../services"
import { cn } from "@/lib/utils"

interface FinancialSummaryCardProps {
  summary: FinancialSummary
}

export function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const isPositive = summary.netBalance >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rata-rata {formatCurrency(summary.avgDailyIncome)}/hari
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500">
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rata-rata {formatCurrency(summary.avgDailyExpense)}/hari
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            )}
          >
            {formatCurrency(summary.netBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.transactionCount} transaksi
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tingkat Tabungan</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              summary.savingsRate >= 20
                ? "text-green-600 dark:text-green-500"
                : summary.savingsRate >= 10
                  ? "text-yellow-600 dark:text-yellow-500"
                  : "text-red-600 dark:text-red-500"
            )}
          >
            {summary.savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.savingsRate >= 20
              ? "Sangat baik!"
              : summary.savingsRate >= 10
                ? "Cukup baik"
                : "Perlu ditingkatkan"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
