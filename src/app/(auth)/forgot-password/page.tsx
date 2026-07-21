import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form"

export const metadata: Metadata = {
  title: "Lupa Password — Family Finance",
  description: "Reset password akun Family Finance Anda",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Lupa Password?</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Masukkan email Anda dan kami akan kirimkan link reset password
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </div>
  )
}
