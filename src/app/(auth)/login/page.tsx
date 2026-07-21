import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/features/auth/components/login-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Masuk — Family Finance",
  description: "Masuk ke akun Family Finance Anda",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Selamat Datang Kembali</h1>
          <p className="text-muted-foreground mt-2 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {/* Suspense required for useSearchParams */}
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
