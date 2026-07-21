"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import {
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
  RepeatIcon,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/utils/format"
import { deleteBillAction, markBillAsPaidAction, markBillAsUnpaidAction } from "../actions"
import type { Bill } from "@prisma/client"
import { differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

// =============================================================================
// COMPONENT
// =============================================================================

interface BillCardProps {
  bill: Bill
}

export function BillCard({ bill }: BillCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const amount = Number(bill.amount)
  const dueDate = new Date(bill.dueDate)
  const daysUntilDue = differenceInDays(dueDate, new Date())

  // Determine status badge
  const isOverdue = bill.status === "OVERDUE"
  const isPaid = bill.status === "PAID"
  const isUpcoming = bill.status === "UPCOMING"
  const isDueSoon = daysUntilDue <= bill.reminderDays && daysUntilDue >= 0

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteBillAction(bill.id)

    if (result.success) {
      setShowDeleteDialog(false)
      router.refresh()
    } else {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  const handleTogglePaid = async () => {
    setIsProcessing(true)

    const result = bill.isPaid
      ? await markBillAsUnpaidAction(bill.id)
      : await markBillAsPaidAction(bill.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }

    setIsProcessing(false)
  }

  // Get status badge variant
  const getStatusBadge = () => {
    if (isPaid) {
      return <Badge className="bg-green-500">✓ Lunas</Badge>
    }
    if (isOverdue) {
      return <Badge variant="destructive">Terlambat</Badge>
    }
    if (isDueSoon) {
      return <Badge variant="warning">Segera Jatuh Tempo</Badge>
    }
    return <Badge variant="secondary">Mendatang</Badge>
  }

  return (
    <>
      <Card
        className={cn(
          "transition-shadow hover:shadow-md",
          isPaid && "border-green-500/50 bg-green-50/50 dark:bg-green-950/20",
          isOverdue && !isPaid && "border-destructive/50 bg-destructive/5"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {isPaid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {isOverdue && !isPaid && <AlertCircle className="h-5 w-5 text-destructive" />}
                {bill.name}
              </CardTitle>
              <CardDescription className="mt-1">{formatCurrency(amount)}</CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/bills/${bill.id}/edit`)}
                className="h-8 w-8"
                disabled={isProcessing}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 text-destructive hover:text-destructive"
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Due Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Jatuh tempo: {formatDate(dueDate)}</span>
          </div>

          {/* Days Until Due */}
          {!isPaid && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              {isOverdue ? (
                <span className="text-destructive font-medium">
                  Terlambat {Math.abs(daysUntilDue)} hari
                </span>
              ) : (
                <span className={cn(isDueSoon && "text-warning font-medium")}>
                  {daysUntilDue === 0
                    ? "Jatuh tempo hari ini"
                    : `${daysUntilDue} hari lagi`}
                </span>
              )}
            </div>
          )}

          {/* Paid Date */}
          {isPaid && bill.paidAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span>Dibayar: {formatDate(new Date(bill.paidAt))}</span>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {getStatusBadge()}
            {bill.isRecurring && (
              <Badge variant="outline" className="gap-1">
                <RepeatIcon className="h-3 w-3" />
                Berulang
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2">
            <Button
              variant={isPaid ? "outline" : "default"}
              size="sm"
              onClick={handleTogglePaid}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : isPaid ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Tandai Belum Lunas
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tandai Lunas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tagihan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tagihan &quot;{bill.name}&quot; akan dihapus
              secara permanen.
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
    </>
  )
}
