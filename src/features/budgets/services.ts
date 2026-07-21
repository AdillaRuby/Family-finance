"use server"

import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"
import type { BudgetPeriod } from "@prisma/client"

/**
 * Budget Services
 * Server-side data fetching for budgets
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Budget {
  id: string
  amount: number
  spent: number
  period: BudgetPeriod
  startDate: Date
  endDate: Date
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  percentage: number
  status: "safe" | "warning" | "danger" | "exceeded"
}

// ============================================================================
// GET BUDGETS
// ============================================================================

export async function getBudgets(familyId: string): Promise<Budget[]> {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const budgets = await prisma.budget.findMany({
    where: {
      familyId,
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: {
      spent: "desc",
    },
  })

  return budgets.map((b) => {
    const amount = Number(b.amount)
    const spent = Number(b.spent)
    const percentage = amount > 0 ? (spent / amount) * 100 : 0

    let status: Budget["status"] = "safe"
    if (percentage >= 100) status = "exceeded"
    else if (percentage >= 80) status = "danger"
    else if (percentage >= 60) status = "warning"

    return {
      id: b.id,
      amount,
      spent,
      period: b.period,
      startDate: b.startDate,
      endDate: b.endDate,
      category: b.category,
      percentage: Math.round(percentage),
      status,
    }
  })
}

// ============================================================================
// GET BUDGET BY ID
// ============================================================================

export async function getBudgetById(
  familyId: string,
  budgetId: string
): Promise<Budget | null> {
  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      familyId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  })

  if (!budget) return null

  const amount = Number(budget.amount)
  const spent = Number(budget.spent)
  const percentage = amount > 0 ? (spent / amount) * 100 : 0

  let status: Budget["status"] = "safe"
  if (percentage >= 100) status = "exceeded"
  else if (percentage >= 80) status = "danger"
  else if (percentage >= 60) status = "warning"

  return {
    id: budget.id,
    amount,
    spent,
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    category: budget.category,
    percentage: Math.round(percentage),
    status,
  }
}

// ============================================================================
// UPDATE BUDGET SPENT (Called after transaction create/update/delete)
// ============================================================================

export async function updateBudgetSpent(
  familyId: string,
  categoryId: string,
  date: Date
): Promise<void> {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)

  // Find budgets for this category that cover this date
  const budgets = await prisma.budget.findMany({
    where: {
      familyId,
      categoryId,
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
  })

  for (const budget of budgets) {
    // Calculate total spent in this budget period
    const transactions = await prisma.transaction.findMany({
      where: {
        familyId,
        categoryId,
        type: "EXPENSE",
        date: {
          gte: budget.startDate,
          lte: budget.endDate,
        },
        deletedAt: null,
      },
      select: {
        amount: true,
      },
    })

    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Update budget
    await prisma.budget.update({
      where: { id: budget.id },
      data: { spent: totalSpent },
    })
  }
}
