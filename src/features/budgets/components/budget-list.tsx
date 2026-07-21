"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/utils/format"
import { Pencil, Trash2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import type { Budget } from "../services"
import { deleteBudgetAction } from "../actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BudgetListProps {
  budgets: Budget[]
}

export function BudgetList({ budgets }: BudgetListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setIsDeleting(true)
    const result = await deleteBudgetAction(deleteId)

    if (result.success) {
      setDeleteId(null)
      router.refresh()
    }

    setIsDeleting(false)
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum Ada Budget</CardTitle>
          <CardDescription>Mulai buat budget untuk kontrol pengeluaran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada budget yang dibuat. Klik tombol &quot;Buat Budget&quot; di atas untuk memulai.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if any budget exceeded or in danger
  const exceededBudgets = budgets.filter((b) => b.status === "exceeded")
  const dangerBudgets = budgets.filter((b) => b.status === "danger")

  return (
    <>
      {/* Alerts */}
      {exceededBudgets.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{exceededBudgets.length} budget</strong> sudah melewati batas! Pertimbangkan
            untuk mengurangi pengeluaran di kategori:{" "}
            {exceededBudgets.map((b) => b.category.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {dangerBudgets.length > 0 && exceededBudgets.length === 0 && (
        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <strong>{dangerBudgets.length} budget</strong> sudah mencapai 80%! Hati-hati dengan
            pengeluaran di: {dangerBudgets.map((b) => b.category.name).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((budget) => (
          <Card key={budget.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: budget.category.color || "#6b7280" }}
                  />
                  <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/budgets/${budget.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(budget.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(budget.spent)}</p>
                  <p className="text-sm text-muted-foreground">
                    dari {formatCurrency(budget.amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-2xl font-bold ${
                      budget.status === "exceeded"
                        ? "text-red-600 dark:text-red-400"
                        : budget.status === "danger"
                          ? "text-orange-600 dark:text-orange-400"
                          : budget.status === "warning"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {budget.percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {budget.period === "MONTHLY" ? "Bulanan" : "Tahunan"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <Progress
                  value={Math.min(budget.percentage, 100)}
                  className="h-2"
                  indicatorClassName={
                    budget.status === "exceeded" || budget.status === "danger"
                      ? "bg-red-600"
                      : budget.status === "warning"
                        ? "bg-yellow-600"
                        : "bg-green-600"
                  }
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Sisa: {formatCurrency(Math.max(budget.amount - budget.spent, 0))}
                  </span>
                  {budget.status === "exceeded" ? (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3 w-3" />
                      Melebihi budget
                    </span>
                  ) : budget.status === "danger" ? (
                    <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3" />
                      Hampir habis
                    </span>
                  ) : budget.status === "warning" ? (
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <AlertTriangle className="h-3 w-3" />
                      Perhatian
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      Aman
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Budget?</AlertDialogTitle>
            <AlertDialogDescription>
              Budget akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
