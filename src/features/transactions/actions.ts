"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/features/auth/utils"
import type { TransactionType } from "@prisma/client"
import { updateBudgetSpent } from "@/features/budgets/services"

/**
 * Transaction Actions
 * Server Actions for transaction CRUD operations
 */

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createTransactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Jumlah harus lebih dari 0",
  }),
  description: z.string().min(1, "Deskripsi tidak boleh kosong"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Tanggal tidak valid",
  }),
})

const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().min(1),
})

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================================
// CREATE TRANSACTION
// ============================================================================

export async function createTransactionAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = {
      type: formData.get("type") as string,
      categoryId: formData.get("categoryId") as string,
      amount: formData.get("amount") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    }

    const validated = createTransactionSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { type, categoryId, amount, description, date } = validated.data

    // Verify category belongs to user's family
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        familyId: user.familyId,
        type: type as TransactionType,
      },
    })

    if (!category) {
      return { success: false, error: "Kategori tidak valid" }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        familyId: user.familyId,
        userId: user.id,
        categoryId,
        type: type as TransactionType,
        amount: Number(amount),
        description,
        date: new Date(date),
      },
    })

    // Update budget spent if expense
    if (type === "EXPENSE") {
      await updateBudgetSpent(user.familyId, categoryId, new Date(date))
    }

    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true, data: { id: transaction.id } }
  } catch (error) {
    console.error("Create transaction error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// UPDATE TRANSACTION
// ============================================================================

export async function updateTransactionAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = {
      id: formData.get("id") as string,
      type: formData.get("type") as string,
      categoryId: formData.get("categoryId") as string,
      amount: formData.get("amount") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    }

    const validated = updateTransactionSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { id, type, categoryId, amount, description, date } = validated.data

    // Verify transaction exists and belongs to user's family
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        familyId: user.familyId,
        deletedAt: null,
      },
    })

    if (!existingTransaction) {
      return { success: false, error: "Transaksi tidak ditemukan" }
    }

    // Verify category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        familyId: user.familyId,
        type: type as TransactionType,
      },
    })

    if (!category) {
      return { success: false, error: "Kategori tidak valid" }
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id },
      data: {
        categoryId,
        type: type as TransactionType,
        amount: Number(amount),
        description,
        date: new Date(date),
      },
    })

    // Update budget spent if expense
    if (type === "EXPENSE") {
      await updateBudgetSpent(user.familyId, categoryId, new Date(date))
      // Also update old category if changed
      if (existingTransaction.categoryId !== categoryId) {
        await updateBudgetSpent(
          user.familyId,
          existingTransaction.categoryId,
          existingTransaction.date
        )
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true }
  } catch (error) {
    console.error("Update transaction error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// DELETE TRANSACTION (Soft Delete)
// ============================================================================

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify transaction exists and belongs to user's family
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        familyId: user.familyId,
        deletedAt: null,
      },
    })

    if (!transaction) {
      return { success: false, error: "Transaksi tidak ditemukan" }
    }

    // Soft delete
    await prisma.transaction.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })

    // Update budget spent if expense
    if (transaction.type === "EXPENSE") {
      await updateBudgetSpent(user.familyId, transaction.categoryId, transaction.date)
    }

    revalidatePath("/dashboard")
    revalidatePath("/transactions")

    return { success: true }
  } catch (error) {
    console.error("Delete transaction error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}
