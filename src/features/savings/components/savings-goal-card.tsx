"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Target,
  Calendar,
  PlusCircle,
  MinusCircle,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import { deleteSavingsGoalAction, addSavingsAction, withdrawSavingsAction } from "../actions"
import type { SavingsGoal } from "@prisma/client"
import { differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

// =============================================================================
// COMPONENT
// =============================================================================

interface SavingsGoalCardProps {
  goal: SavingsGoal
}

export function SavingsGoalCard({ goal }: SavingsGoalCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  const currentAmount = Number(goal.currentAmount)
  const targetAmount = Number(goal.targetAmount)
  const remaining = targetAmount - currentAmount
  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0

  // Calculate days until deadline
  const daysUntilDeadline = goal.deadline
    ? differenceInDays(new Date(goal.deadline), new Date())
    : null

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteSavingsGoalAction(goal.id)

    if (result.success) {
      setShowDeleteDialog(false)
      router.refresh()
    } else {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  const handleAdd = async () => {
    setIsProcessing(true)
    setError(null)

    const result = await addSavingsAction(goal.id, { amount: parseFloat(amount) })

    if (result.success) {
      setShowAddDialog(false)
      setAmount("")
      router.refresh()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }

    setIsProcessing(false)
  }

  const handleWithdraw = async () => {
    setIsProcessing(true)
    setError(null)

    const result = await withdrawSavingsAction(goal.id, { amount: parseFloat(amount) })

    if (result.success) {
      setShowWithdrawDialog(false)
      setAmount("")
      router.refresh()
    } else {
      setError(result.error || "Terjadi kesalahan")
    }

    setIsProcessing(false)
  }

  // Determine progress color
  const progressColor =
    progress >= 100
      ? "bg-green-500"
      : progress >= 75
        ? "bg-blue-500"
        : progress >= 50
          ? "bg-yellow-500"
          : "bg-orange-500"

  // Determine status
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.isCompleted
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 30 && !goal.isCompleted

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden transition-shadow hover:shadow-md",
          goal.isCompleted && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
        )}
      >
        {goal.imageUrl && (
          <div className="h-32 w-full overflow-hidden">
            <img
              src={goal.imageUrl}
              alt={goal.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {goal.isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {goal.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {formatCurrency(currentAmount)} / {formatCurrency(targetAmount)}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/savings/${goal.id}/edit`)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} indicatorClassName={progressColor} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Sisa: {formatCurrency(remaining)}</span>
            </div>
            {goal.deadline && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(new Date(goal.deadline))}</span>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {goal.isCompleted && <Badge className="bg-green-500">✓ Tercapai</Badge>}
            {isOverdue && <Badge variant="destructive">Terlambat</Badge>}
            {isUrgent && !isOverdue && (
              <Badge variant="warning">
                {daysUntilDeadline} hari lagi
              </Badge>
            )}
            {!goal.isCompleted && daysUntilDeadline && daysUntilDeadline > 30 && (
              <Badge variant="secondary">{daysUntilDeadline} hari lagi</Badge>
            )}
          </div>

          {/* Actions */}
          {!goal.isCompleted && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWithdrawDialog(true)}
                className="w-full"
                disabled={currentAmount <= 0}
              >
                <MinusCircle className="mr-2 h-4 w-4" />
                Tarik
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tujuan Tabungan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tujuan tabungan &quot;{goal.name}&quot; akan
              dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tabungan</DialogTitle>
            <DialogDescription>
              Masukkan jumlah yang ingin ditambahkan ke &quot;{goal.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="add-amount">Jumlah</Label>
              <Input
                id="add-amount"
                type="number"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setAmount("")
                  setError(null)
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tarik Tabungan</DialogTitle>
            <DialogDescription>
              Masukkan jumlah yang ingin ditarik dari &quot;{goal.name}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Jumlah</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Saldo tersedia: {formatCurrency(currentAmount)}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowWithdrawDialog(false)
                  setAmount("")
                  setError(null)
                }}
                disabled={isProcessing}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleWithdraw}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Tarik
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
