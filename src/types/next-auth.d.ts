import type { Role } from "@prisma/client"
import type { DefaultSession } from "next-auth"

/**
 * Module augmentation for NextAuth types
 * Adds custom fields to the session object
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      familyId?: string
      familyName?: string
      role?: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    emailVerified?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}
