"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCurrency, formatCompactNumber } from "@/utils/format"
import type { MonthlyTrend } from "../services"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface MonthlyTrendsChartProps {
  trends: MonthlyTrend[]
}

export function MonthlyTrendsChart({ trends }: MonthlyTrendsChartProps) {
  if (trends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Bulanan</CardTitle>
          <CardDescription>Perbandingan pemasukan vs pengeluaran per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            Tidak ada data untuk ditampilkan
          </p>
        </CardContent>
      </Card>
    )
  }

  // Format data for chart
  const chartData = trends.map((trend) => {
    const date = new Date(trend.month + "-01")
    return {
      month: format(date, "MMM yy", { locale: id }),
      Pemasukan: trend.income,
      Pengeluaran: trend.expense,
      Saldo: trend.balance,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Bulanan</CardTitle>
        <CardDescription>Perbandingan pemasukan vs pengeluaran per bulan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Bar
              dataKey="Pemasukan"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Pengeluaran"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
