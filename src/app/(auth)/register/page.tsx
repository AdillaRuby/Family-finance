import type { Metadata } from "next"
import { RegisterForm } from "@/features/auth/components/register-form"

export const metadata: Metadata = {
  title: "Daftar — Family Finance",
  description: "Buat akun Family Finance baru",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Buat Akun Baru</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Kelola keuangan keluarga dengan mudah
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  )
}
