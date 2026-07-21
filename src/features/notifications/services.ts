import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@prisma/client"

// =============================================================================
// SERVICES
// =============================================================================

export async function getNotifications(userId: string, limit?: number) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  })

  return notifications
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  return count
}

export async function getNotificationsByType(userId: string, type: NotificationType) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      type,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return notifications
}
