import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getTransactions } from "@/features/transactions/services"
import { TransactionList } from "@/features/transactions/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/format"

export default async function TransactionsPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  const transactions = await getTransactions(user.familyId)

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground mt-1">Kelola semua transaksi keuangan keluarga</p>
        </div>
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pemasukan</CardDescription>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.type === "INCOME").length} transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pengeluaran</CardDescription>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                {formatCurrency(totalExpense)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {transactions.filter((t) => t.type === "EXPENSE").length} transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Selisih</CardDescription>
              <CardTitle
                className={`text-2xl ${
                  totalIncome - totalExpense >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(totalIncome - totalExpense)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {totalIncome - totalExpense >= 0 ? "Surplus" : "Defisit"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction List */}
      <TransactionList transactions={transactions} />
    </div>
  )
}
