"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/features/auth/utils"

// =============================================================================
// SCHEMAS
// =============================================================================

const savingsGoalSchema = z.object({
  name: z.string().min(1, "Nama tujuan harus diisi").max(100, "Nama terlalu panjang"),
  targetAmount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      const num = typeof val === "string" ? Number(val) : val
      if (isNaN(num)) throw new Error("Jumlah target harus berupa angka")
      if (num <= 0) throw new Error("Jumlah target harus lebih dari 0")
      if (num > 999999999999) throw new Error("Jumlah terlalu besar")
      return num
    }),
  deadline: z.union([z.coerce.date(), z.null(), z.undefined()]).optional().nullable(),
  imageUrl: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return null
      // Validate URL if present
      const urlCheck = z.string().url().safeParse(val)
      if (!urlCheck.success) throw new Error("URL gambar tidak valid")
      return val
    }),
})

const addSavingsSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Jumlah harus lebih dari 0")
    .max(999999999999, "Jumlah terlalu besar"),
})

// =============================================================================
// ACTIONS
// =============================================================================

export async function createSavingsGoalAction(data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = savingsGoalSchema.parse(data)

    // Create savings goal
    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        familyId: user.familyId!,
        name: validated.name,
        targetAmount: validated.targetAmount,
        currentAmount: 0,
        deadline: validated.deadline || null,
        imageUrl: validated.imageUrl || null,
        isCompleted: false,
      },
    })

    revalidatePath("/savings")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: savingsGoal,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Create savings goal error:", error)
    return {
      success: false,
      error: "Gagal membuat tujuan tabungan. Silakan coba lagi.",
    }
  }
}

export async function updateSavingsGoalAction(id: string, data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = savingsGoalSchema.parse(data)

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tujuan tabungan tidak ditemukan",
      }
    }

    // Update savings goal
    const savingsGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name: validated.name,
        targetAmount: validated.targetAmount,
        deadline: validated.deadline || null,
        imageUrl: validated.imageUrl || null,
      },
    })

    revalidatePath("/savings")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: savingsGoal,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Update savings goal error:", error)
    return {
      success: false,
      error: "Gagal mengubah tujuan tabungan. Silakan coba lagi.",
    }
  }
}

export async function deleteSavingsGoalAction(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tujuan tabungan tidak ditemukan",
      }
    }

    // Delete savings goal
    await prisma.savingsGoal.delete({
      where: { id },
    })

    revalidatePath("/savings")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete savings goal error:", error)
    return {
      success: false,
      error: "Gagal menghapus tujuan tabungan. Silakan coba lagi.",
    }
  }
}

export async function addSavingsAction(id: string, data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = addSavingsSchema.parse(data)

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tujuan tabungan tidak ditemukan",
      }
    }

    // Calculate new amount
    const newAmount = Number(existing.currentAmount) + validated.amount
    const targetAmount = Number(existing.targetAmount)
    const isCompleted = newAmount >= targetAmount

    // Update savings goal
    const savingsGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        isCompleted,
      },
    })

    // Create notification if milestone reached
    if (isCompleted && !existing.isCompleted) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "SAVINGS_COMPLETED",
          title: "🎉 Tujuan Tabungan Tercapai!",
          message: `Selamat! Anda telah mencapai target tabungan "${existing.name}"`,
          metadata: { savingsGoalId: id },
        },
      })
    } else {
      // Check for milestone (50%, 75%, 90%)
      const oldProgress = (Number(existing.currentAmount) / targetAmount) * 100
      const newProgress = (newAmount / targetAmount) * 100

      const milestones = [50, 75, 90]
      for (const milestone of milestones) {
        if (oldProgress < milestone && newProgress >= milestone) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "SAVINGS_MILESTONE",
              title: `🎯 ${milestone}% Tercapai!`,
              message: `Anda telah mencapai ${milestone}% dari target "${existing.name}"`,
              metadata: { savingsGoalId: id, milestone },
            },
          })
          break
        }
      }
    }

    revalidatePath("/savings")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: savingsGoal,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Add savings error:", error)
    return {
      success: false,
      error: "Gagal menambah tabungan. Silakan coba lagi.",
    }
  }
}

export async function withdrawSavingsAction(id: string, data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = addSavingsSchema.parse(data)

    // Check ownership
    const existing = await prisma.savingsGoal.findFirst({
      where: {
        id,
        familyId: user.familyId!,
      },
    })

    if (!existing) {
      return {
        success: false,
        error: "Tujuan tabungan tidak ditemukan",
      }
    }

    // Check if enough balance
    const newAmount = Number(existing.currentAmount) - validated.amount
    if (newAmount < 0) {
      return {
        success: false,
        error: "Saldo tidak mencukupi",
      }
    }

    // Calculate new amount
    const targetAmount = Number(existing.targetAmount)
    const isCompleted = newAmount >= targetAmount

    // Update savings goal
    const savingsGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: newAmount,
        isCompleted,
      },
    })

    revalidatePath("/savings")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: savingsGoal,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Withdraw savings error:", error)
    return {
      success: false,
      error: "Gagal menarik tabungan. Silakan coba lagi.",
    }
  }
}
