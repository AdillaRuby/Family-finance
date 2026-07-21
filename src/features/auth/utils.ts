import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cache } from "react"

/**
 * Server-side helper to get current session
 * Cached to prevent multiple database calls in a single request
 */
export const getCurrentUser = cache(async () => {
  const session = await auth()
  return session?.user
})

/**
 * Server-side helper to require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

/**
 * Server-side helper to require specific role
 * Redirects to dashboard if user doesn't have required role
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!user.role || !allowedRoles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}
