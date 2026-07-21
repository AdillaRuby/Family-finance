"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/features/auth/utils"
import type { BillStatus } from "@prisma/client"

// =============================================================================
// SCHEMAS
// =============================================================================

const billSchema = z.object({
  name: z.string().min(1, "Nama tagihan harus diisi").max(100, "Nama terlalu panjang"),
  amount: z
    .number()
    .positive("Jumlah harus lebih dari 0")
    .max(999999999999, "Jumlah terlalu besar"),
  dueDate: z.coerce.date(),
  reminderDays: z
    .number()
    .int("Harus berupa bilangan bulat")
    .min(0, "Minimal 0 hari")
    .max(30, "Maksimal 30 hari"),
  isRecurring: z.boolean(),
  recurrenceRule: z.string().optional().nullable(),
})

// =============================================================================
// ACTIONS
// =============================================================================

export async function createBillAction(data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = billSchema.parse(data)

    // Determine initial status
    const now = new Date()
    const dueDate = new Date(validated.dueDate)
    let status: BillStatus = "UPCOMING"

    if (dueDate < now) {
      status = "OVERDUE"
    }

    // Create bill
    const bill = await prisma.bill.create({
      data: {
        familyId: user.familyId!,
        name: validated.name,
        amount: validated.amount,
        dueDate: validated.dueDate,
        status,
        isPaid: false,
        reminderDays: validated.reminderDays,
        isRecurring: validated.isRecurring,
        recurrenceRule: validated.recurrenceRule || null,
      },
    })

    // Create reminder notification if due soon
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntilDue <= validated.reminderDays && daysUntilDue >= 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "BILL_REMINDER",
          title: "🔔 Pengingat Tagihan",
          message: `Tagihan "${validated.name}" jatuh tempo dalam ${daysUntilDue} hari`,
          metadata: { billId: bill.id },
        },
      })
    }

    revalidatePath("/bills")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: bill,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Create bill error:", error)
    return {
      success: false,
      error: "Gagal membuat tagihan. Silakan coba lagi.",
    }
  }
}

export async function updateBillAction(id: string, data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = billSchema.parse(data)

    // Check ownership
    const existing = await prisma.bill.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tagihan tidak ditemukan",
      }
    }

    // Determine status
    const now = new Date()
    const dueDate = new Date(validated.dueDate)
    let status: BillStatus = "UPCOMING"

    if (existing.isPaid) {
      status = "PAID"
    } else if (dueDate < now) {
      status = "OVERDUE"
    }

    // Update bill
    const bill = await prisma.bill.update({
      where: { id },
      data: {
        name: validated.name,
        amount: validated.amount,
        dueDate: validated.dueDate,
        status,
        reminderDays: validated.reminderDays,
        isRecurring: validated.isRecurring,
        recurrenceRule: validated.recurrenceRule || null,
      },
    })

    revalidatePath("/bills")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: bill,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Update bill error:", error)
    return {
      success: false,
      error: "Gagal mengubah tagihan. Silakan coba lagi.",
    }
  }
}

export async function deleteBillAction(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const existing = await prisma.bill.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tagihan tidak ditemukan",
      }
    }

    // Delete bill
    await prisma.bill.delete({
      where: { id },
    })

    revalidatePath("/bills")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete bill error:", error)
    return {
      success: false,
      error: "Gagal menghapus tagihan. Silakan coba lagi.",
    }
  }
}

export async function markBillAsPaidAction(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const existing = await prisma.bill.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tagihan tidak ditemukan",
      }
    }

    if (existing.isPaid) {
      return {
        success: false,
        error: "Tagihan sudah dibayar",
      }
    }

    // Find or create a default "Tagihan" category for bills
    let billCategory = await prisma.category.findFirst({
      where: {
        familyId: user.familyId!,
        name: "Tagihan",
        type: "EXPENSE",
      },
    })

    if (!billCategory) {
      billCategory = await prisma.category.create({
        data: {
          familyId: user.familyId!,
          name: "Tagihan",
          type: "EXPENSE",
          isDefault: false,
        },
      })
    }

    const now = new Date()

    // Mark as paid
    const bill = await prisma.bill.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: now,
        status: "PAID",
      },
    })

    // Auto-create transaction for the payment
    const transaction = await prisma.transaction.create({
      data: {
        familyId: user.familyId!,
        userId: user.id,
        categoryId: billCategory.id,
        type: "EXPENSE",
        amount: bill.amount,
        description: `Pembayaran ${bill.name}`,
        date: now,
        attachments: [],
      },
    })

    // Update budget if exists for this category
    const budget = await prisma.budget.findFirst({
      where: {
        familyId: user.familyId!,
        categoryId: billCategory.id,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    })

    if (budget) {
      await prisma.budget.update({
        where: { id: budget.id },
        data: {
          spent: {
            increment: bill.amount,
          },
        },
      })
    }

    // If recurring, create next bill
    if (bill.isRecurring && bill.recurrenceRule) {
      const nextDueDate = calculateNextDueDate(bill.dueDate, bill.recurrenceRule)

      if (nextDueDate) {
        await prisma.bill.create({
          data: {
            familyId: bill.familyId,
            name: bill.name,
            amount: bill.amount,
            dueDate: nextDueDate,
            status: "UPCOMING",
            isPaid: false,
            reminderDays: bill.reminderDays,
            isRecurring: bill.isRecurring,
            recurrenceRule: bill.recurrenceRule,
          },
        })
      }
    }

    revalidatePath("/bills")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/expenses")

    return {
      success: true,
      data: bill,
      transactionId: transaction.id,
    }
  } catch (error) {
    console.error("Mark bill as paid error:", error)
    return {
      success: false,
      error: "Gagal menandai tagihan sebagai lunas. Silakan coba lagi.",
    }
  }
}

export async function markBillAsUnpaidAction(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const existing = await prisma.bill.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tagihan tidak ditemukan",
      }
    }

    if (!existing.isPaid) {
      return {
        success: false,
        error: "Tagihan belum dibayar",
      }
    }

    // Find transaction that was created for this bill payment
    // Look for transaction with matching description and amount on the paid date
    if (existing.paidAt) {
      const relatedTransaction = await prisma.transaction.findFirst({
        where: {
          familyId: user.familyId!,
          type: "EXPENSE",
          amount: existing.amount,
          description: `Pembayaran ${existing.name}`,
          date: existing.paidAt,
          deletedAt: null,
        },
        include: {
          category: true,
        },
      })

      // Soft delete the transaction
      if (relatedTransaction) {
        await prisma.transaction.update({
          where: { id: relatedTransaction.id },
          data: { deletedAt: new Date() },
        })

        // Update budget if exists
        const budget = await prisma.budget.findFirst({
          where: {
            familyId: user.familyId!,
            categoryId: relatedTransaction.categoryId,
            startDate: { lte: existing.paidAt },
            endDate: { gte: existing.paidAt },
          },
        })

        if (budget) {
          await prisma.budget.update({
            where: { id: budget.id },
            data: {
              spent: {
                decrement: existing.amount,
              },
            },
          })
        }
      }
    }

    // Determine status
    const now = new Date()
    const dueDate = new Date(existing.dueDate)
    const status: BillStatus = dueDate < now ? "OVERDUE" : "UPCOMING"

    // Mark as unpaid
    const bill = await prisma.bill.update({
      where: { id },
      data: {
        isPaid: false,
        paidAt: null,
        status,
      },
    })

    revalidatePath("/bills")
    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/expenses")

    return {
      success: true,
      data: bill,
    }
  } catch (error) {
    console.error("Mark bill as unpaid error:", error)
    return {
      success: false,
      error: "Gagal menandai tagihan sebagai belum lunas. Silakan coba lagi.",
    }
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function calculateNextDueDate(currentDueDate: Date, recurrenceRule: string): Date | null {
  try {
    const rule = JSON.parse(recurrenceRule)
    const date = new Date(currentDueDate)

    switch (rule.frequency) {
      case "DAILY":
        date.setDate(date.getDate() + (rule.interval || 1))
        break
      case "WEEKLY":
        date.setDate(date.getDate() + 7 * (rule.interval || 1))
        break
      case "MONTHLY":
        date.setMonth(date.getMonth() + (rule.interval || 1))
        break
      case "YEARLY":
        date.setFullYear(date.getFullYear() + (rule.interval || 1))
        break
      default:
        return null
    }

    return date
  } catch (error) {
    console.error("Calculate next due date error:", error)
    return null
  }
}
