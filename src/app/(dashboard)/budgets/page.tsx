import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getBudgets } from "@/features/budgets/services"
import { BudgetList } from "@/features/budgets/components/budget-list"
import { Button } from "@/components/ui/button"
import { Plus, PiggyBank } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/format"

export default async function BudgetsPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  const budgets = await getBudgets(user.familyId)

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anggaran</h1>
          <p className="text-muted-foreground mt-1">Rencanakan dan pantau anggaran keluarga</p>
        </div>
        <Button asChild>
          <Link href="/budgets/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Budget
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Budget</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalBudget)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{budgets.length} budget aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Terpakai</CardDescription>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                {formatCurrency(totalSpent)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {overallPercentage.toFixed(1)}% dari budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Sisa Budget</CardDescription>
              <CardTitle
                className={`text-2xl ${
                  totalRemaining >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(Math.abs(totalRemaining))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {totalRemaining >= 0 ? "Tersisa" : "Over budget"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>Status</CardDescription>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle
                className={`text-2xl ${
                  overallPercentage >= 100
                    ? "text-red-600 dark:text-red-400"
                    : overallPercentage >= 80
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              >
                {overallPercentage >= 100
                  ? "Melebihi"
                  : overallPercentage >= 80
                    ? "Hati-hati"
                    : "Aman"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Status keseluruhan</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget List */}
      <BudgetList budgets={budgets} />
    </div>
  )
}
