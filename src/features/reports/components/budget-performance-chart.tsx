"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/format"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"

interface BudgetPerformance {
  budgetId: string
  categoryName: string
  amount: number
  spent: number
  remaining: number
  percentage: number
  status: "safe" | "moderate" | "warning" | "exceeded"
}

interface BudgetPerformanceChartProps {
  performance: BudgetPerformance[]
}

export function BudgetPerformanceChart({ performance }: BudgetPerformanceChartProps) {
  if (performance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kinerja Anggaran</CardTitle>
          <CardDescription>Status penggunaan anggaran per kategori</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            Tidak ada anggaran aktif untuk periode ini
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string, percentage: number) => {
    switch (status) {
      case "safe":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Aman
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="secondary" className="gap-1">
            Sedang
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Perhatian
          </Badge>
        )
      case "exceeded":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Melebihi
          </Badge>
        )
      default:
        return null
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-500"
      case "moderate":
        return "bg-blue-500"
      case "warning":
        return "bg-yellow-500"
      case "exceeded":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kinerja Anggaran</CardTitle>
        <CardDescription>Status penggunaan anggaran per kategori</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {performance.map((item) => (
          <div key={item.budgetId} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium">{item.categoryName}</div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(item.spent)} dari {formatCurrency(item.amount)}
                </div>
              </div>
              <div className="text-right space-y-1">
                {getStatusBadge(item.status, item.percentage)}
                <div className="text-sm font-semibold">
                  {item.percentage.toFixed(0)}%
                </div>
              </div>
            </div>

            <Progress
              value={Math.min(item.percentage, 100)}
              indicatorClassName={getProgressColor(item.status)}
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {item.remaining >= 0 ? "Sisa" : "Kelebihan"}: {formatCurrency(Math.abs(item.remaining))}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
