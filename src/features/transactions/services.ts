"use server"

import { prisma } from "@/lib/prisma"
import type { TransactionType } from "@prisma/client"

/**
 * Transaction Services
 * Server-side data fetching for transactions
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string | null
  date: Date
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
    type: TransactionType
  }
  user: {
    name: string | null
  }
  createdAt: Date
}

export interface TransactionFilters {
  type?: TransactionType
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

// ============================================================================
// GET TRANSACTIONS
// ============================================================================

export async function getTransactions(
  familyId: string,
  filters?: TransactionFilters,
  limit = 50
): Promise<Transaction[]> {
  const where: Record<string, unknown> = {
    familyId,
    deletedAt: null,
  }

  if (filters?.type) {
    where.type = filters.type
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters?.dateFrom || filters?.dateTo) {
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (filters.dateFrom) {
      dateFilter.gte = filters.dateFrom
    }
    if (filters.dateTo) {
      dateFilter.lte = filters.dateTo
    }
    where.date = dateFilter
  }

  if (filters?.search) {
    where.description = {
      contains: filters.search,
      mode: "insensitive",
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
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
    type: t.type,
    amount: Number(t.amount),
    description: t.description,
    date: t.date,
    category: t.category,
    user: t.user,
    createdAt: t.createdAt,
  }))
}

// ============================================================================
// GET TRANSACTION BY ID
// ============================================================================

export async function getTransactionById(
  familyId: string,
  transactionId: string
): Promise<Transaction | null> {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      familyId,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          type: true,
        },
      },
      user: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!transaction) return null

  return {
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    description: transaction.description,
    date: transaction.date,
    category: transaction.category,
    user: transaction.user,
    createdAt: transaction.createdAt,
  }
}

// ============================================================================
// GET CATEGORIES FOR FAMILY
// ============================================================================

export async function getCategoriesForFamily(
  familyId: string,
  type?: TransactionType
): Promise<Array<{ id: string; name: string; icon: string | null; color: string | null; type: TransactionType }>> {
  const categories = await prisma.category.findMany({
    where: {
      familyId,
      ...(type && { type }),
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      type: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return categories
}
