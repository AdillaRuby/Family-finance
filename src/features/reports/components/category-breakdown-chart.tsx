"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/utils/format"
import type { CategoryReport } from "../services"

interface CategoryBreakdownChartProps {
  categories: CategoryReport[]
  type: "INCOME" | "EXPENSE"
}

export function CategoryBreakdownChart({ categories, type }: CategoryBreakdownChartProps) {
  const title = type === "INCOME" ? "Sumber Pemasukan" : "Kategori Pengeluaran"
  const description =
    type === "INCOME"
      ? "Breakdown pemasukan berdasarkan kategori"
      : "Breakdown pengeluaran berdasarkan kategori"

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            Tidak ada data untuk periode ini
          </p>
        </CardContent>
      </Card>
    )
  }

  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => (
          <div key={category.categoryId} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{category.categoryName}</span>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(category.amount)}</div>
                <div className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}% · {category.count} transaksi
                </div>
              </div>
            </div>
            <Progress
              value={category.percentage}
              indicatorClassName={
                type === "INCOME"
                  ? "bg-green-500"
                  : category.percentage > 30
                    ? "bg-red-500"
                    : category.percentage > 20
                      ? "bg-orange-500"
                      : category.percentage > 10
                        ? "bg-yellow-500"
                        : "bg-blue-500"
              }
            />
          </div>
        ))}

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
