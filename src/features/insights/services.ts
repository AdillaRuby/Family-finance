import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, differenceInDays } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export interface Insight {
  id: string
  type: "warning" | "success" | "info" | "tip"
  category: "spending" | "saving" | "budget" | "income" | "general"
  title: string
  description: string
  action?: string
  priority: number
}

// =============================================================================
// SERVICES
// =============================================================================

export async function generateInsights(familyId: string): Promise<Insight[]> {
  const insights: Insight[] = []

  // Get data for analysis
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Fetch all needed data
  const [
    thisMonthTransactions,
    lastMonthTransactions,
    budgets,
    savingsGoals,
    bills,
  ] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        familyId,
        deletedAt: null,
        date: { gte: thisMonthStart, lte: thisMonthEnd },
      },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: {
        familyId,
        deletedAt: null,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    prisma.budget.findMany({
      where: {
        familyId,
        startDate: { lte: thisMonthEnd },
        endDate: { gte: thisMonthStart },
      },
      include: { category: true },
    }),
    prisma.savingsGoal.findMany({
      where: { familyId, isCompleted: false },
    }),
    prisma.bill.findMany({
      where: { familyId, isPaid: false },
    }),
  ])

  // Calculate metrics
  const thisMonthIncome = thisMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const thisMonthExpense = thisMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const lastMonthExpense = lastMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // 1. Spending trend analysis
  if (lastMonthExpense > 0) {
    const expenseChange = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100

    if (expenseChange > 20) {
      insights.push({
        id: "high-spending-increase",
        type: "warning",
        category: "spending",
        title: "Pengeluaran Meningkat Signifikan",
        description: `Pengeluaran Anda naik ${expenseChange.toFixed(1)}% dari bulan lalu. Pertimbangkan untuk meninjau kembali kebiasaan belanja Anda.`,
        priority: 10,
      })
    } else if (expenseChange < -15) {
      insights.push({
        id: "spending-decrease",
        type: "success",
        category: "spending",
        title: "Pengeluaran Menurun!",
        description: `Kerja bagus! Pengeluaran Anda turun ${Math.abs(expenseChange).toFixed(1)}% dari bulan lalu.`,
        priority: 5,
      })
    }
  }

  // 2. Savings rate analysis
  if (thisMonthIncome > 0) {
    const savingsRate = ((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100

    if (savingsRate < 10) {
      insights.push({
        id: "low-savings-rate",
        type: "warning",
        category: "saving",
        title: "Tingkat Tabungan Rendah",
        description: `Tingkat tabungan Anda ${savingsRate.toFixed(1)}%. Target ideal adalah minimal 20% dari pemasukan.`,
        action: "Buat anggaran ketat dan kurangi pengeluaran tidak penting",
        priority: 9,
      })
    } else if (savingsRate >= 20) {
      insights.push({
        id: "good-savings-rate",
        type: "success",
        category: "saving",
        title: "Tingkat Tabungan Sangat Baik",
        description: `Tingkat tabungan Anda ${savingsRate.toFixed(1)}%. Terus pertahankan kebiasaan baik ini!`,
        priority: 3,
      })
    }
  }

  // 3. Budget analysis
  for (const budget of budgets) {
    const percentage = Number(budget.amount) > 0 ? (Number(budget.spent) / Number(budget.amount)) * 100 : 0

    if (percentage >= 90 && percentage < 100) {
      insights.push({
        id: `budget-warning-${budget.id}`,
        type: "warning",
        category: "budget",
        title: `Budget ${budget.category.name} Hampir Habis`,
        description: `Anda telah menggunakan ${percentage.toFixed(0)}% dari budget ${budget.category.name}.`,
        action: "Batasi pengeluaran untuk kategori ini",
        priority: 8,
      })
    } else if (percentage >= 100) {
      insights.push({
        id: `budget-exceeded-${budget.id}`,
        type: "warning",
        category: "budget",
        title: `Budget ${budget.category.name} Terlampaui`,
        description: `Anda telah melampaui budget ${budget.category.name} sebesar ${(percentage - 100).toFixed(0)}%.`,
        action: "Segera kurangi pengeluaran untuk kategori ini",
        priority: 10,
      })
    }
  }

  // 4. Savings goal progress
  for (const goal of savingsGoals) {
    const progress = Number(goal.targetAmount) > 0 ? (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100 : 0

    if (goal.deadline) {
      const daysLeft = differenceInDays(new Date(goal.deadline), now)
      const daysTotal = differenceInDays(new Date(goal.deadline), new Date(goal.createdAt))
      const expectedProgress = daysTotal > 0 ? ((daysTotal - daysLeft) / daysTotal) * 100 : 0

      if (progress < expectedProgress - 20 && daysLeft > 0) {
        insights.push({
          id: `savings-behind-${goal.id}`,
          type: "warning",
          category: "saving",
          title: `Tujuan "${goal.name}" Tertinggal`,
          description: `Progress ${progress.toFixed(0)}%, target ${expectedProgress.toFixed(0)}%. Tingkatkan kontribusi untuk mencapai target tepat waktu.`,
          action: "Alokasikan lebih banyak dana untuk tujuan ini",
          priority: 7,
        })
      } else if (progress > expectedProgress + 10) {
        insights.push({
          id: `savings-ahead-${goal.id}`,
          type: "success",
          category: "saving",
          title: `Tujuan "${goal.name}" On Track!`,
          description: `Anda ${(progress - expectedProgress).toFixed(0)}% lebih cepat dari jadwal. Teruskan!`,
          priority: 2,
        })
      }
    }
  }

  // 5. Upcoming bills
  const upcomingBills = bills.filter((b) => {
    const daysUntilDue = differenceInDays(new Date(b.dueDate), now)
    return daysUntilDue <= 7 && daysUntilDue >= 0
  })

  if (upcomingBills.length > 0) {
    insights.push({
      id: "upcoming-bills",
      type: "info",
      category: "general",
      title: "Tagihan Segera Jatuh Tempo",
      description: `Anda memiliki ${upcomingBills.length} tagihan yang akan jatuh tempo dalam 7 hari ke depan.`,
      action: "Cek halaman Tagihan untuk detail",
      priority: 6,
    })
  }

  // 6. Category spending tips
  const categorySpending = thisMonthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => {
      const cat = t.category.name
      acc[cat] = (acc[cat] || 0) + Number(t.amount)
      return acc
    }, {} as Record<string, number>)

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

  if (topCategory && thisMonthExpense > 0) {
    const percentage = (topCategory[1] / thisMonthExpense) * 100
    if (percentage > 40) {
      insights.push({
        id: "high-category-spending",
        type: "tip",
        category: "spending",
        title: `Pengeluaran Tinggi di ${topCategory[0]}`,
        description: `${percentage.toFixed(0)}% pengeluaran Anda untuk ${topCategory[0]}. Cari cara untuk menghemat di kategori ini.`,
        action: "Set budget ketat untuk kategori ini",
        priority: 6,
      })
    }
  }

  // 7. No transaction warning
  if (thisMonthTransactions.length === 0) {
    insights.push({
      id: "no-transactions",
      type: "info",
      category: "general",
      title: "Belum Ada Transaksi Bulan Ini",
      description: "Mulai catat transaksi Anda untuk mendapatkan insights yang lebih baik.",
      action: "Tambah transaksi pertama Anda",
      priority: 5,
    })
  }

  // Sort by priority (higher first)
  return insights.sort((a, b) => b.priority - a.priority)
}
