import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from "date-fns"

// =============================================================================
// TYPES
// =============================================================================

export type ReportPeriod = "thisMonth" | "lastMonth" | "thisYear" | "lastYear" | "custom"

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface CategoryReport {
  categoryId: string
  categoryName: string
  type: "INCOME" | "EXPENSE"
  amount: number
  count: number
  percentage: number
}

export interface MonthlyTrend {
  month: string
  income: number
  expense: number
  balance: number
}

export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  savingsRate: number
  avgDailyExpense: number
  avgDailyIncome: number
  transactionCount: number
}

// =============================================================================
// SERVICES
// =============================================================================

export async function getFinancialSummary(familyId: string, dateRange: DateRange) {
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      deletedAt: null,
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    },
  })

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const netBalance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0

  const daysDiff = Math.ceil(
    (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const avgDailyExpense = daysDiff > 0 ? totalExpense / daysDiff : 0
  const avgDailyIncome = daysDiff > 0 ? totalIncome / daysDiff : 0

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    avgDailyExpense,
    avgDailyIncome,
    transactionCount: transactions.length,
  }
}

export async function getCategoryBreakdown(familyId: string, dateRange: DateRange) {
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      deletedAt: null,
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    },
    include: {
      category: true,
    },
  })

  // Group by category
  const categoryMap = new Map<string, CategoryReport>()

  for (const transaction of transactions) {
    const key = transaction.categoryId
    const existing = categoryMap.get(key)

    if (existing) {
      existing.amount += Number(transaction.amount)
      existing.count += 1
    } else {
      categoryMap.set(key, {
        categoryId: transaction.categoryId,
        categoryName: transaction.category.name,
        type: transaction.type,
        amount: Number(transaction.amount),
        count: 1,
        percentage: 0,
      })
    }
  }

  // Calculate percentages
  const incomeTotal = Array.from(categoryMap.values())
    .filter((c) => c.type === "INCOME")
    .reduce((sum, c) => sum + c.amount, 0)

  const expenseTotal = Array.from(categoryMap.values())
    .filter((c) => c.type === "EXPENSE")
    .reduce((sum, c) => sum + c.amount, 0)

  for (const category of categoryMap.values()) {
    const total = category.type === "INCOME" ? incomeTotal : expenseTotal
    category.percentage = total > 0 ? (category.amount / total) * 100 : 0
  }

  // Sort by amount descending
  const categories = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount)

  return {
    income: categories.filter((c) => c.type === "INCOME"),
    expense: categories.filter((c) => c.type === "EXPENSE"),
  }
}

export async function getMonthlyTrends(familyId: string, months = 12) {
  const trends: MonthlyTrend[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(now, i)
    const startDate = startOfMonth(date)
    const endDate = endOfMonth(date)

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    trends.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM
      income,
      expense,
      balance: income - expense,
    })
  }

  return trends
}

export async function getBudgetPerformance(familyId: string, dateRange: DateRange) {
  const budgets = await prisma.budget.findMany({
    where: {
      familyId,
      startDate: {
        lte: dateRange.endDate,
      },
      endDate: {
        gte: dateRange.startDate,
      },
    },
    include: {
      category: true,
    },
  })

  const performance = budgets.map((budget) => {
    const amount = Number(budget.amount)
    const spent = Number(budget.spent)
    const remaining = amount - spent
    const percentage = amount > 0 ? (spent / amount) * 100 : 0

    let status: "safe" | "moderate" | "warning" | "exceeded"
    if (percentage >= 100) {
      status = "exceeded"
    } else if (percentage >= 80) {
      status = "warning"
    } else if (percentage >= 50) {
      status = "moderate"
    } else {
      status = "safe"
    }

    return {
      budgetId: budget.id,
      categoryName: budget.category.name,
      amount,
      spent,
      remaining,
      percentage,
      status,
    }
  })

  return performance.sort((a, b) => b.percentage - a.percentage)
}

export async function getSavingsProgress(familyId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      familyId,
    },
  })

  const total = goals.length
  const completed = goals.filter((g) => g.isCompleted).length
  const active = total - completed

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  const goalsProgress = goals.map((goal) => {
    const target = Number(goal.targetAmount)
    const current = Number(goal.currentAmount)
    const progress = target > 0 ? (current / target) * 100 : 0

    return {
      goalId: goal.id,
      name: goal.name,
      target,
      current,
      progress,
      isCompleted: goal.isCompleted,
    }
  })

  return {
    summary: {
      total,
      completed,
      active,
      totalTarget,
      totalSaved,
      overallProgress,
    },
    goals: goalsProgress.sort((a, b) => b.progress - a.progress),
  }
}

export async function getTopTransactions(
  familyId: string,
  dateRange: DateRange,
  limit = 10
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      deletedAt: null,
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    },
    include: {
      category: true,
      user: true,
    },
    orderBy: {
      amount: "desc",
    },
    take: limit,
  })

  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    categoryName: t.category.name,
    userName: t.user.name,
    date: t.date,
  }))
}

// =============================================================================
// HELPERS
// =============================================================================

export function getDateRangeFromPeriod(period: ReportPeriod, customRange?: DateRange): DateRange {
  const now = new Date()

  switch (period) {
    case "thisMonth":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      }
    case "lastMonth":
      const lastMonth = subMonths(now, 1)
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      }
    case "thisYear":
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
      }
    case "lastYear":
      const lastYear = subYears(now, 1)
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      }
    case "custom":
      return customRange || { startDate: startOfMonth(now), endDate: endOfMonth(now) }
    default:
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      }
  }
}
