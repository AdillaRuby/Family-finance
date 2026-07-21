"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/features/auth/utils"

// =============================================================================
// ACTIONS
// =============================================================================

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    })

    if (!notification) {
      return {
        success: false,
        error: "Notifikasi tidak ditemukan",
      }
    }

    // Mark as read
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return {
      success: false,
      error: "Gagal menandai notifikasi. Silakan coba lagi.",
    }
  }
}

export async function markAllAsReadAction() {
  try {
    const user = await requireAuth()

    // Mark all unread notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Mark all as read error:", error)
    return {
      success: false,
      error: "Gagal menandai semua notifikasi. Silakan coba lagi.",
    }
  }
}

export async function deleteNotificationAction(notificationId: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
    })

    if (!notification) {
      return {
        success: false,
        error: "Notifikasi tidak ditemukan",
      }
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete notification error:", error)
    return {
      success: false,
      error: "Gagal menghapus notifikasi. Silakan coba lagi.",
    }
  }
}

export async function clearAllNotificationsAction() {
  try {
    const user = await requireAuth()

    // Delete all notifications
    await prisma.notification.deleteMany({
      where: {
        userId: user.id,
      },
    })

    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Clear all notifications error:", error)
    return {
      success: false,
      error: "Gagal menghapus semua notifikasi. Silakan coba lagi.",
    }
  }
}
