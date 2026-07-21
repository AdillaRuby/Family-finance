"use server"

import { hash } from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { revalidatePath } from "next/cache"

/**
 * Server Actions for Authentication
 *
 * All form submissions use Server Actions (per spec §2 Priority Rule #6).
 * No API routes needed for these operations.
 */

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  })

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
})

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  })

// ============================================================================
// TYPES
// ============================================================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

// ============================================================================
// LOGIN
// ============================================================================

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const validated = loginSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validated.data

    // Sign in with credentials
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirect: false,
    })

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email atau password salah" }
        default:
          return { success: false, error: "Terjadi kesalahan. Coba lagi." }
      }
    }
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// REGISTER
// ============================================================================

export async function registerAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validated = registerSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { name, email, password } = validated.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar" }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    })

    // Create default family
    const family = await prisma.family.create({
      data: {
        name: `Keluarga ${name.split(" ")[0]}`,
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

    // Create default categories
    await prisma.category.createMany({
      data: [
        // Income
        {
          familyId: family.id,
          name: "Gaji",
          type: "INCOME",
          icon: "Briefcase",
          color: "#10b981",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Bonus",
          type: "INCOME",
          icon: "Gift",
          color: "#8b5cf6",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Investasi",
          type: "INCOME",
          icon: "TrendingUp",
          color: "#3b82f6",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Lainnya",
          type: "INCOME",
          icon: "DollarSign",
          color: "#6b7280",
          isDefault: true,
        },
        // Expense
        {
          familyId: family.id,
          name: "Makanan & Minuman",
          type: "EXPENSE",
          icon: "UtensilsCrossed",
          color: "#ef4444",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Transportasi",
          type: "EXPENSE",
          icon: "Car",
          color: "#f59e0b",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Belanja",
          type: "EXPENSE",
          icon: "ShoppingBag",
          color: "#ec4899",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Tagihan",
          type: "EXPENSE",
          icon: "FileText",
          color: "#06b6d4",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Pendidikan",
          type: "EXPENSE",
          icon: "GraduationCap",
          color: "#8b5cf6",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Kesehatan",
          type: "EXPENSE",
          icon: "Heart",
          color: "#f43f5e",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Hiburan",
          type: "EXPENSE",
          icon: "Sparkles",
          color: "#14b8a6",
          isDefault: true,
        },
        {
          familyId: family.id,
          name: "Lainnya",
          type: "EXPENSE",
          icon: "MoreHorizontal",
          color: "#6b7280",
          isDefault: true,
        },
      ],
    })

    // TODO: Send verification email (Milestone 3 - phase 2)

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// FORGOT PASSWORD
// ============================================================================

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
    }

    const validated = forgotPasswordSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Email tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { email } = validated.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase(), deletedAt: null },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true }
    }

    // Generate reset token (valid for 1 hour)
    const token = crypto.randomUUID()
    const expires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    })

    // TODO: Send reset email with token (Milestone 3 - phase 2)
    console.log("Reset token:", token)

    return { success: true }
  } catch (error) {
    console.error("Forgot password error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// RESET PASSWORD
// ============================================================================

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      token: formData.get("token") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const validated = resetPasswordSchema.safeParse(rawData)

    if (!validated.success) {
      return {
        success: false,
        error: "Data tidak valid",
        fieldErrors: validated.error.flatten().fieldErrors,
      }
    }

    const { token, password } = validated.data

    // Find and validate token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return { success: false, error: "Token tidak valid atau sudah kadaluarsa" }
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return { success: false, error: "Token sudah kadaluarsa" }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier, deletedAt: null },
    })

    if (!user) {
      return { success: false, error: "User tidak ditemukan" }
    }

    // Update password
    const hashedPassword = await hash(password, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({ where: { token } })

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Terjadi kesalahan. Coba lagi." }
  }
}

// ============================================================================
// GOOGLE SIGN IN
// ============================================================================

export async function signInWithGoogleAction() {
  await signIn("google", { redirectTo: "/dashboard" })
}
