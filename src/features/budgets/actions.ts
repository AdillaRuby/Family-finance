"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/features/auth/utils"
import { startOfMonth, endOfMonth, addMonths } from "date-fns"
import type { BudgetPeriod } from "@prisma/client"

/**
 * Budget Actions
 * Server Actions for budget CRUD operations
 */

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Jumlah harus lebih dari 0",
  }),
  period: z.enum(["MONTHLY", "YEARLY"]),
})

const updateBudgetSchema = createBudgetSchema.extend({
  id: z.string().min(1),
})

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================================
// CREATE BUDGET
// ============================================================================

export async function createBudgetAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = {
      categoryId: formData.get("categoryId") as string,
      amount: formData.get("amount") as string,
      period: formData.get("period") as string,
    }

    const validated = createBudgetSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { categoryId, amount, period } = validated.data

    // Verify category belongs to user's family and is EXPENSE type
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        familyId: user.familyId,
        type: "EXPENSE", // Budgets only for expenses
      },
    })

    if (!category) {
      return { success: false, error: "Kategori tidak valid" }
    }

    // Calculate start and end dates
    const now = new Date()
    const startDate = startOfMonth(now)
    const endDate =
      period === "MONTHLY"
        ? endOfMonth(now)
        : endOfMonth(addMonths(now, 11)) // 12 months for yearly

    // Check if budget already exists for this category and period
    const existingBudget = await prisma.budget.findFirst({
      where: {
        familyId: user.familyId,
        categoryId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    })

    if (existingBudget) {
      return { success: false, error: "Budget untuk kategori ini sudah ada" }
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        familyId: user.familyId,
        categoryId,
        amount: Number(amount),
        period: period as BudgetPeriod,
        startDate,
        endDate,
      },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return { success: true, data: { id: budget.id } }
  } catch (error) {
    console.error("Create budget error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// UPDATE BUDGET
// ============================================================================

export async function updateBudgetAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    const rawData = {
      id: formData.get("id") as string,
      categoryId: formData.get("categoryId") as string,
      amount: formData.get("amount") as string,
      period: formData.get("period") as string,
    }

    const validated = updateBudgetSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { id, categoryId, amount, period } = validated.data

    // Verify budget exists and belongs to user's family
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
    })

    if (!existingBudget) {
      return { success: false, error: "Budget tidak ditemukan" }
    }

    // Verify category
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        familyId: user.familyId,
        type: "EXPENSE",
      },
    })

    if (!category) {
      return { success: false, error: "Kategori tidak valid" }
    }

    // Update budget
    await prisma.budget.update({
      where: { id },
      data: {
        categoryId,
        amount: Number(amount),
        period: period as BudgetPeriod,
      },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Update budget error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// DELETE BUDGET
// ============================================================================

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user || !user.familyId) {
      return { success: false, error: "Unauthorized" }
    }

    // Verify budget exists and belongs to user's family
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        familyId: user.familyId,
      },
    })

    if (!budget) {
      return { success: false, error: "Budget tidak ditemukan" }
    }

    // Delete budget
    await prisma.budget.delete({
      where: { id },
    })

    revalidatePath("/budgets")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Delete budget error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}
