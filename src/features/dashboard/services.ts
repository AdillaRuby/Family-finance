"use server"

import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { id as localeId } from "date-fns/locale"

/**
 * Dashboard Services
 * Server-side data fetching for dashboard
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  balance: number
  budgetUsage: number // Percentage
  savingsProgress: number // Percentage
}

export interface MonthlyTrend {
  month: string // "Jan", "Feb", etc
  income: number
  expense: number
}

export interface RecentTransaction {
  id: string
  description: string | null
  amount: number
  type: "INCOME" | "EXPENSE"
  category: {
    name: string
    icon: string | null
    color: string | null
  }
  date: Date
  user: {
    name: string | null
  }
}

export interface BudgetProgress {
  id: string
  category: {
    name: string
    icon: string | null
    color: string | null
  }
  amount: number
  spent: number
  percentage: number
  period: string
}

// ============================================================================
// GET DASHBOARD STATS
// ============================================================================

export async function getDashboardStats(
  familyId: string,
  _userId: string
): Promise<DashboardStats> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Get transactions for current month
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
      deletedAt: null,
    },
    select: {
      amount: true,
      type: true,
    },
  })

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const balance = totalIncome - totalExpense

  // Get budget usage
  const budgets = await prisma.budget.findMany({
    where: {
      familyId,
      period: "MONTHLY",
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
    select: {
      amount: true,
      spent: true,
    },
  })

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0)
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0)
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Get savings progress
  const savingsGoals = await prisma.savingsGoal.findMany({
    where: {
      familyId,
      isCompleted: false,
    },
    select: {
      targetAmount: true,
      currentAmount: true,
    },
  })

  const totalTarget = savingsGoals.reduce((sum, s) => sum + Number(s.targetAmount), 0)
  const totalCurrent = savingsGoals.reduce((sum, s) => sum + Number(s.currentAmount), 0)
  const savingsProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0

  return {
    totalIncome,
    totalExpense,
    balance,
    budgetUsage: Math.round(budgetUsage),
    savingsProgress: Math.round(savingsProgress),
  }
}

// ============================================================================
// GET MONTHLY TRENDS (Last 6 months)
// ============================================================================

export async function getMonthlyTrends(familyId: string): Promise<MonthlyTrend[]> {
  const now = new Date()
  const trends: MonthlyTrend[] = []

  for (let i = 5; i >= 0; i--) {
    const targetDate = subMonths(now, i)
    const monthStart = startOfMonth(targetDate)
    const monthEnd = endOfMonth(targetDate)

    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        deletedAt: null,
      },
      select: {
        amount: true,
        type: true,
      },
    })

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    trends.push({
      month: format(targetDate, "MMM", { locale: localeId }),
      income,
      expense,
    })
  }

  return trends
}

// ============================================================================
// GET RECENT TRANSACTIONS
// ============================================================================

export async function getRecentTransactions(
  familyId: string,
  limit = 10
): Promise<RecentTransaction[]> {
  const transactions = await prisma.transaction.findMany({
    where: {
      familyId,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: limit,
  })

  return transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: Number(t.amount),
    type: t.type,
    category: t.category,
    date: t.date,
    user: t.user,
  }))
}

// ============================================================================
// GET BUDGET PROGRESS
// ============================================================================

export async function getBudgetProgress(familyId: string): Promise<BudgetProgress[]> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const budgets = await prisma.budget.findMany({
    where: {
      familyId,
      period: "MONTHLY",
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
    include: {
      category: {
        select: {
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      spent: "desc",
    },
    take: 5,
  })

  return budgets.map((b) => ({
    id: b.id,
    category: b.category,
    amount: Number(b.amount),
    spent: Number(b.spent),
    percentage: Math.round((Number(b.spent) / Number(b.amount)) * 100),
    period: format(b.startDate, "MMMM yyyy", { locale: localeId }),
  }))
}
