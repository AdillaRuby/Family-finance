import { prisma } from "@/lib/prisma"

// =============================================================================
// SERVICES
// =============================================================================

export async function getSavingsGoals(familyId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      familyId,
    },
    orderBy: [
      { isCompleted: "asc" },
      { deadline: "asc" },
      { createdAt: "desc" },
    ],
  })

  return goals
}

export async function getSavingsGoalById(id: string, familyId: string) {
  const goal = await prisma.savingsGoal.findFirst({
    where: {
      id,
      familyId,
    },
  })

  return goal
}

export async function getSavingsStats(familyId: string) {
  const goals = await prisma.savingsGoal.findMany({
    where: {
      familyId,
    },
  })

  const total = goals.length
  const completed = goals.filter((g) => g.isCompleted).length
  const active = goals.filter((g) => !g.isCompleted).length

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0)
  const totalRemaining = totalTarget - totalSaved

  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return {
    total,
    completed,
    active,
    totalTarget,
    totalSaved,
    totalRemaining,
    overallProgress,
  }
}
