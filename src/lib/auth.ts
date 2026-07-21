import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { env } from "@/env"

/**
 * Auth.js v5 configuration for Family Finance
 *
 * Providers:
 * - Credentials (email/password with bcrypt)
 * - Google OAuth
 *
 * Features:
 * - Database sessions via Prisma Adapter
 * - Email verification support
 * - Custom callbacks for role-based access
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt", // Use JWT instead of database for better compatibility with Credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
  },

  providers: [
    // Credentials Provider (Email/Password)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase(), deletedAt: null },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            emailVerified: true,
            image: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isValidPassword = await compare(password, user.password)

        if (!isValidPassword) {
          return null
        }

        // Return user (password excluded)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
        }
      },
    }),

    // Google OAuth Provider
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true, // Auto-link existing email accounts
    }),
  ],

  callbacks: {
    /**
     * JWT callback - Add user data to token
     */
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image

        // Get user's family memberships with roles
        const familyMemberships = await prisma.familyMember.findMany({
          where: {
            userId: user.id,
            isActive: true,
          },
          include: {
            family: {
              select: {
                id: true,
                name: true,
                currency: true,
              },
            },
          },
          orderBy: {
            role: "asc", // Admin first
          },
        })

        // Attach first active family membership to token
        const primary = familyMemberships[0]
        if (primary) {
          token.familyId = primary.familyId
          token.familyName = primary.family.name
          token.role = primary.role
        }
      }

      return token
    },

    /**
     * Session callback - Pass token data to session
     */
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.familyId = token.familyId as string | undefined
        session.user.familyName = token.familyName as string | undefined
        session.user.role = token.role as "ADMIN" | "PARENT" | "CHILD" | undefined
      }

      return session
    },

    /**
     * Redirect callback - Control where users go after auth
     */
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`

      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url

      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
  },

  events: {
    /**
     * Create default family when user signs up via OAuth
     */
    async createUser({ user }) {
      // Create a personal family for the user
      const family = await prisma.family.create({
        data: {
          name: `Keluarga ${user.name?.split(" ")[0] || "Saya"}`,
          currency: "IDR",
        },
      })

      // Add user as admin
      await prisma.familyMember.create({
        data: {
          familyId: family.id,
          userId: user.id,
          role: "ADMIN",
        },
      })

      // Create default categories for the family
      await createDefaultCategories(family.id)
    },
  },

  debug: process.env.NODE_ENV === "development",
})

/**
 * Helper: Create default categories for a new family
 */
async function createDefaultCategories(familyId: string) {
  await prisma.category.createMany({
    data: [
      // Income categories
      {
        familyId,
        name: "Gaji",
        type: "INCOME",
        icon: "Briefcase",
        color: "#10b981",
        isDefault: true,
      },
      { familyId, name: "Bonus", type: "INCOME", icon: "Gift", color: "#8b5cf6", isDefault: true },
      {
        familyId,
        name: "Investasi",
        type: "INCOME",
        icon: "TrendingUp",
        color: "#3b82f6",
        isDefault: true,
      },
      {
        familyId,
        name: "Lainnya",
        type: "INCOME",
        icon: "DollarSign",
        color: "#6b7280",
        isDefault: true,
      },

      // Expense categories
      {
        familyId,
        name: "Makanan & Minuman",
        type: "EXPENSE",
        icon: "UtensilsCrossed",
        color: "#ef4444",
        isDefault: true,
      },
      {
        familyId,
        name: "Transportasi",
        type: "EXPENSE",
        icon: "Car",
        color: "#f59e0b",
        isDefault: true,
      },
      {
        familyId,
        name: "Belanja",
        type: "EXPENSE",
        icon: "ShoppingBag",
        color: "#ec4899",
        isDefault: true,
      },
      {
        familyId,
        name: "Tagihan",
        type: "EXPENSE",
        icon: "FileText",
        color: "#06b6d4",
        isDefault: true,
      },
      {
        familyId,
        name: "Pendidikan",
        type: "EXPENSE",
        icon: "GraduationCap",
        color: "#8b5cf6",
        isDefault: true,
      },
      {
        familyId,
        name: "Kesehatan",
        type: "EXPENSE",
        icon: "Heart",
        color: "#f43f5e",
        isDefault: true,
      },
      {
        familyId,
        name: "Hiburan",
        type: "EXPENSE",
        icon: "Sparkles",
        color: "#14b8a6",
        isDefault: true,
      },
      {
        familyId,
        name: "Lainnya",
        type: "EXPENSE",
        icon: "MoreHorizontal",
        color: "#6b7280",
        isDefault: true,
      },
    ],
  })
}
