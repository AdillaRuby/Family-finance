"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/features/auth/utils"
import bcrypt from "bcryptjs"

// =============================================================================
// SCHEMAS
// =============================================================================

const updateProfileSchema = z.object({
  name: z.string().min(1, "Nama harus diisi").max(100, "Nama terlalu panjang"),
  email: z.string().email("Email tidak valid"),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

const updateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.enum(["id", "en"]),
  currency: z.string().length(3, "Kode currency harus 3 karakter"),
})

// =============================================================================
// ACTIONS
// =============================================================================

export async function updateProfileAction(data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = updateProfileSchema.parse(data)

    // Check if email is already taken by another user
    if (validated.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      })

      if (existingUser && existingUser.id !== user.id) {
        return {
          success: false,
          error: "Email sudah digunakan oleh pengguna lain",
        }
      }
    }

    // Update profile
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validated.name,
        email: validated.email,
      },
    })

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Update profile error:", error)
    return {
      success: false,
      error: "Gagal mengubah profil. Silakan coba lagi.",
    }
  }
}

export async function changePasswordAction(data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = changePasswordSchema.parse(data)

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!userWithPassword?.password) {
      return {
        success: false,
        error: "Akun Anda menggunakan login sosial. Password tidak dapat diubah.",
      }
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      validated.currentPassword,
      userWithPassword.password
    )

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Password saat ini salah",
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validated.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    revalidatePath("/settings")

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Change password error:", error)
    return {
      success: false,
      error: "Gagal mengubah password. Silakan coba lagi.",
    }
  }
}

export async function updateUserSettingsAction(data: unknown) {
  try {
    const user = await requireAuth()

    // Validate input
    const validated = updateUserSettingsSchema.parse(data)

    // Check if settings exist
    const existingSettings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    })

    if (existingSettings) {
      // Update settings
      await prisma.userSettings.update({
        where: { userId: user.id },
        data: validated,
      })
    } else {
      // Create settings
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          ...validated,
        },
      })
    }

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Data tidak valid",
      }
    }

    console.error("Update user settings error:", error)
    return {
      success: false,
      error: "Gagal mengubah pengaturan. Silakan coba lagi.",
    }
  }
}
