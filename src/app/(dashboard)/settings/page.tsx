import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { requireAuth } from "@/features/auth/utils"
import { getUserSettings } from "@/features/settings/services"
import { ProfileForm } from "@/features/settings/components/profile-form"
import { PasswordForm } from "@/features/settings/components/password-form"
import { PreferencesForm } from "@/features/settings/components/preferences-form"

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil dan preferensi aplikasi Anda</p>
      </div>

      <div className="grid gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <ProfileSection user={user} />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <PasswordSection />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <PreferencesSection userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}

async function ProfileSection({ user }: { user: { id: string; name?: string | null; email?: string | null } }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
        <CardDescription>Informasi akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm user={user} />
      </CardContent>
    </Card>
  )
}

async function PasswordSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan</CardTitle>
        <CardDescription>Ubah password akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <PasswordForm />
      </CardContent>
    </Card>
  )
}

async function PreferencesSection({ userId }: { userId: string }) {
  const settings = await getUserSettings(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferensi</CardTitle>
        <CardDescription>Kustomisasi pengalaman aplikasi Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <PreferencesForm settings={settings} />
      </CardContent>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}
