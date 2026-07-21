"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireRole } from "@/features/auth/utils"
import { Role } from "@prisma/client"

// =============================================================================
// SCHEMAS
// =============================================================================

const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["ADMIN", "PARENT", "CHILD"]),
})

const toggleMemberStatusSchema = z.object({
  memberId: z.string().uuid(),
})

const updateFamilyNameSchema = z.object({
  name: z.string().min(1, "Nama keluarga harus diisi").max(100, "Nama terlalu panjang"),
})

// =============================================================================
// ACTIONS
// =============================================================================

export async function updateMemberRoleAction(data: unknown) {
  try {
    const user = await requireRole(["ADMIN"])

    // Validate input
    const validated = updateMemberRoleSchema.parse(data)

    // Check if member exists and belongs to the family
    const member = await prisma.familyMember.findFirst({
      where: {
        id: validated.memberId,
        familyId: user.familyId!,
      },
    })

    if (!member) {
      return {
        success: false,
        error: "Anggota keluarga tidak ditemukan",
      }
    }

    // Prevent user from changing their own role
    if (member.userId === user.id) {
      return {
        success: false,
        error: "Anda tidak dapat mengubah role Anda sendiri",
      }
    }

    // Check if there will be at least one admin after the change
    if (member.role === "ADMIN" && validated.role !== "ADMIN") {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId: user.familyId!,
          role: "ADMIN",
          isActive: true,
        },
      })

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Harus ada minimal satu admin di keluarga",
        }
      }
    }

    // Update member role
    await prisma.familyMember.update({
      where: { id: validated.memberId },
      data: { role: validated.role },
    })

    revalidatePath("/family")

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

    console.error("Update member role error:", error)
    return {
      success: false,
      error: "Gagal mengubah role anggota. Silakan coba lagi.",
    }
  }
}

export async function toggleMemberStatusAction(data: unknown) {
  try {
    const user = await requireRole(["ADMIN"])

    // Validate input
    const validated = toggleMemberStatusSchema.parse(data)

    // Check if member exists and belongs to the family
    const member = await prisma.familyMember.findFirst({
      where: {
        id: validated.memberId,
        familyId: user.familyId!,
      },
    })

    if (!member) {
      return {
        success: false,
        error: "Anggota keluarga tidak ditemukan",
      }
    }

    // Prevent user from deactivating themselves
    if (member.userId === user.id) {
      return {
        success: false,
        error: "Anda tidak dapat menonaktifkan akun Anda sendiri",
      }
    }

    // Check if there will be at least one active admin after deactivation
    if (member.role === "ADMIN" && member.isActive) {
      const activeAdminCount = await prisma.familyMember.count({
        where: {
          familyId: user.familyId!,
          role: "ADMIN",
          isActive: true,
        },
      })

      if (activeAdminCount <= 1) {
        return {
          success: false,
          error: "Harus ada minimal satu admin aktif di keluarga",
        }
      }
    }

    // Toggle member status
    await prisma.familyMember.update({
      where: { id: validated.memberId },
      data: { isActive: !member.isActive },
    })

    revalidatePath("/family")

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

    console.error("Toggle member status error:", error)
    return {
      success: false,
      error: "Gagal mengubah status anggota. Silakan coba lagi.",
    }
  }
}

export async function removeMemberAction(memberId: string) {
  try {
    const user = await requireRole(["ADMIN"])

    // Check if member exists and belongs to the family
    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: user.familyId!,
      },
    })

    if (!member) {
      return {
        success: false,
        error: "Anggota keluarga tidak ditemukan",
      }
    }

    // Prevent user from removing themselves
    if (member.userId === user.id) {
      return {
        success: false,
        error: "Anda tidak dapat menghapus diri Anda sendiri",
      }
    }

    // Check if there will be at least one admin after removal
    if (member.role === "ADMIN") {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId: user.familyId!,
          role: "ADMIN",
        },
      })

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Harus ada minimal satu admin di keluarga",
        }
      }
    }

    // Remove member
    await prisma.familyMember.delete({
      where: { id: memberId },
    })

    revalidatePath("/family")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Remove member error:", error)
    return {
      success: false,
      error: "Gagal menghapus anggota. Silakan coba lagi.",
    }
  }
}

export async function updateFamilyNameAction(data: unknown) {
  try {
    const user = await requireRole(["ADMIN"])

    // Validate input
    const validated = updateFamilyNameSchema.parse(data)

    // Update family name
    await prisma.family.update({
      where: { id: user.familyId! },
      data: { name: validated.name },
    })

    revalidatePath("/family")
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

    console.error("Update family name error:", error)
    return {
      success: false,
      error: "Gagal mengubah nama keluarga. Silakan coba lagi.",
    }
  }
}

export async function leaveFamilyAction() {
  try {
    const user = await requireAuth()

    if (!user.familyId) {
      return {
        success: false,
        error: "Anda tidak tergabung dalam keluarga",
      }
    }

    // Find member record
    const member = await prisma.familyMember.findFirst({
      where: {
        userId: user.id,
        familyId: user.familyId,
      },
    })

    if (!member) {
      return {
        success: false,
        error: "Data keanggotaan tidak ditemukan",
      }
    }

    // Check if user is the last admin
    if (member.role === "ADMIN") {
      const adminCount = await prisma.familyMember.count({
        where: {
          familyId: user.familyId,
          role: "ADMIN",
        },
      })

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Anda adalah admin terakhir. Transfer role admin ke anggota lain terlebih dahulu.",
        }
      }
    }

    // Remove member
    await prisma.familyMember.delete({
      where: { id: member.id },
    })

    revalidatePath("/family")
    revalidatePath("/dashboard")

    return {
      success: true,
      redirect: "/dashboard",
    }
  } catch (error) {
    console.error("Leave family error:", error)
    return {
      success: false,
      error: "Gagal keluar dari keluarga. Silakan coba lagi.",
    }
  }
}
