import { prisma } from "@/lib/prisma"

// =============================================================================
// SERVICES
// =============================================================================

export async function getFamilyDetails(familyId: string) {
  const family = await prisma.family.findUnique({
    where: { id: familyId },
  })

  return family
}

export async function getFamilyMembers(familyId: string) {
  const members = await prisma.familyMember.findMany({
    where: {
      familyId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: [
      { role: "asc" }, // ADMIN first
      { isActive: "desc" }, // Active first
      { joinedAt: "asc" }, // Oldest first
    ],
  })

  return members
}

export async function getFamilyStats(familyId: string) {
  const members = await prisma.familyMember.findMany({
    where: { familyId },
  })

  const total = members.length
  const active = members.filter((m) => m.isActive).length
  const inactive = total - active
  const admins = members.filter((m) => m.role === "ADMIN").length
  const parents = members.filter((m) => m.role === "PARENT").length
  const children = members.filter((m) => m.role === "CHILD").length

  return {
    total,
    active,
    inactive,
    admins,
    parents,
    children,
  }
}

export async function getMemberActivitySummary(familyId: string) {
  // Get transaction counts per user
  const transactions = await prisma.transaction.groupBy({
    by: ["userId"],
    where: {
      familyId,
      deletedAt: null,
    },
    _count: {
      id: true,
    },
  })

  const activityMap = new Map(transactions.map((t) => [t.userId, t._count.id]))

  return activityMap
}
