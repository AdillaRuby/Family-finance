import { prisma } from "@/lib/prisma"

// =============================================================================
// SERVICES
// =============================================================================

export async function getUserSettings(userId: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  // Return default settings if none exist
  return (
    settings || {
      theme: "system",
      language: "id",
      currency: "IDR",
    }
  )
}
