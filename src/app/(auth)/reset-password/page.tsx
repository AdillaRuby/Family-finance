import type { Metadata } from "next"
import { Suspense } from "react"
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Reset Password — Family Finance",
  description: "Buat password baru untuk akun Anda",
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Buat Password Baru</h1>
          <p className="text-muted-foreground mt-2 text-sm">Masukkan password baru Anda</p>
        </div>

        {/* Suspense required for useSearchParams */}
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
