"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, AlertCircle } from "lucide-react"
import { resetPasswordAction } from "../actions"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Tidak Valid</CardTitle>
          <CardDescription>Link reset password tidak valid atau sudah kadaluarsa.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">Kirim Ulang Link</Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})

    if (token) {
      formData.append("token", token)
    }

    startTransition(async () => {
      const result = await resetPasswordAction(formData)

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else {
        router.push("/login?reset=success")
      }
    })
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Masukkan password baru Anda</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                required
                disabled={isPending}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="text-destructive text-sm">
                {fieldErrors.password[0]}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9"
                required
                disabled={isPending}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p id="confirmPassword-error" className="text-destructive text-sm">
                {fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-muted-foreground w-full text-center text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Kembali ke Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
