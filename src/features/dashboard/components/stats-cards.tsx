import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import { formatCurrency } from "@/utils/format"

interface StatsCardsProps {
  totalIncome: number
  totalExpense: number
  balance: number
  savingsProgress: number
}

export function StatsCards({ totalIncome, totalExpense, balance, savingsProgress }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Income */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Pemasukan</CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{formatCurrency(totalIncome)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Bulan ini</p>
        </CardContent>
      </Card>

      {/* Expense */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Pengeluaran</CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{formatCurrency(totalExpense)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Bulan ini</p>
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Sisa Saldo</CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className={`text-2xl ${balance < 0 ? "text-red-600" : ""}`}>
            {formatCurrency(balance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {balance >= 0 ? "Surplus" : "Defisit"} bulan ini
          </p>
        </CardContent>
      </Card>

      {/* Savings Progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Progress Tabungan</CardDescription>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
              <PiggyBank className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{savingsProgress}%</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Dari target tabungan</p>
        </CardContent>
      </Card>
    </div>
  )
}
