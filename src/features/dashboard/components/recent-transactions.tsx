import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/utils/format"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { RecentTransaction } from "../services"

interface RecentTransactionsProps {
  transactions: RecentTransaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>Belum ada transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Belum ada transaksi yang dicatat. Mulai tambahkan transaksi pertama Anda!
            </p>
            <Button asChild>
              <Link href="/transactions">Tambah Transaksi</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>{transactions.length} transaksi terakhir</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/transactions">Lihat Semua</Link>
          </Button>
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
                  style={{ backgroundColor: `${transaction.category.color || "#6b7280"}20` }}
                >
                  {transaction.type === "INCOME" ? (
                    <ArrowUpRight className="h-5 w-5" style={{ color: transaction.category.color || "#6b7280" }} />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" style={{ color: transaction.category.color || "#6b7280" }} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transaction.description || "Tanpa deskripsi"}</p>
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
                      {formatDate(transaction.date, "relative")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right ml-4">
                <p
                  className={`font-semibold ${
                    transaction.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {transaction.user.name?.split(" ")[0] || "Unknown"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
