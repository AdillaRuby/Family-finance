"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/utils/format"
import { ArrowUpRight, ArrowDownRight, Pencil, Trash2 } from "lucide-react"
import type { Transaction } from "../services"
import type { TransactionType } from "@prisma/client"
import { deleteTransactionAction } from "../actions"
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

interface TransactionListProps {
  transactions: Transaction[]
  categories?: Array<{
    id: string
    name: string
    icon: string | null
    color: string | null
    type: TransactionType
  }>
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return

    setIsDeleting(true)
    const result = await deleteTransactionAction(deleteId)

    if (result.success) {
      setDeleteId(null)
      router.refresh()
    }

    setIsDeleting(false)
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Belum Ada Transaksi</CardTitle>
          <CardDescription>Mulai catat transaksi pertama Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada transaksi yang dicatat. Klik tombol &quot;Tambah Transaksi&quot; di atas untuk memulai.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semua Transaksi</CardTitle>
              <CardDescription>{transactions.length} transaksi ditemukan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${transaction.category.color || "#6b7280"}20`,
                    }}
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowUpRight
                        className="h-5 w-5"
                        style={{ color: transaction.category.color || "#6b7280" }}
                      />
                    ) : (
                      <ArrowDownRight
                        className="h-5 w-5"
                        style={{ color: transaction.category.color || "#6b7280" }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {transaction.description || "Tanpa deskripsi"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: transaction.category.color || "#6b7280",
                          color: transaction.category.color || "#6b7280",
                        }}
                      >
                        {transaction.category.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(transaction.date, "short")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === "INCOME"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.user.name?.split(" ")[0] || "Unknown"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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
