import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, LogOut, Loader2 } from "lucide-react"
import { requireAuth } from "@/features/auth/utils"
import {
  getFamilyDetails,
  getFamilyMembers,
  getFamilyStats,
  getMemberActivitySummary,
} from "@/features/family/services"
import { FamilyHeader } from "@/features/family/components/family-header"
import { MemberCard } from "@/features/family/components/member-card"
import { leaveFamilyAction } from "@/features/family/actions"
import { redirect } from "next/navigation"

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function FamilyPage() {
  const user = await requireAuth()

  if (!user.familyId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Keluarga Tidak Ditemukan</CardTitle>
            <CardDescription>
              Anda harus bergabung dengan keluarga untuk menggunakan fitur ini.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isAdmin = user.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keluarga</h1>
          <p className="text-muted-foreground">Kelola anggota keluarga Anda</p>
        </div>
        <LeaveFamilyButton />
      </div>

      <Suspense fallback={<FamilyHeaderSkeleton />}>
        <FamilyHeaderSection familyId={user.familyId} isAdmin={isAdmin} />
      </Suspense>

      <Suspense fallback={<MembersListSkeleton />}>
        <MembersListSection familyId={user.familyId} currentUserId={user.id} isAdmin={isAdmin} />
      </Suspense>
    </div>
  )
}

// =============================================================================
// SECTIONS
// =============================================================================

async function FamilyHeaderSection({
  familyId,
  isAdmin,
}: {
  familyId: string
  isAdmin: boolean
}) {
  const [family, stats] = await Promise.all([
    getFamilyDetails(familyId),
    getFamilyStats(familyId),
  ])

  if (!family) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Data keluarga tidak ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  return <FamilyHeader family={family} stats={stats} isAdmin={isAdmin} />
}

async function MembersListSection({
  familyId,
  currentUserId,
  isAdmin,
}: {
  familyId: string
  currentUserId: string
  isAdmin: boolean
}) {
  const [members, activityMap] = await Promise.all([
    getFamilyMembers(familyId),
    getMemberActivitySummary(familyId),
  ])

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Belum Ada Anggota</h3>
          <p className="text-center text-sm text-muted-foreground">
            Keluarga Anda belum memiliki anggota
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Anggota Keluarga ({members.length})</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isCurrentUser={member.userId === currentUserId}
            isAdmin={isAdmin}
            activityCount={activityMap.get(member.userId) || 0}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// COMPONENTS
// =============================================================================

function LeaveFamilyButton() {
  async function handleLeave() {
    "use server"
    const result = await leaveFamilyAction()
    if (result.success) {
      redirect("/dashboard")
    } else {
      // Error will be shown via alert in client component
      return result
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Keluar dari Keluarga
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Keluar dari Keluarga?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan kehilangan akses ke semua data keuangan keluarga. Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              const result = await handleLeave()
              if (result && !result.success) {
                alert(result.error)
              }
            }}
          >
            Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// =============================================================================
// SKELETONS
// =============================================================================

function FamilyHeaderSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="mx-auto h-8 w-12" />
              <Skeleton className="mx-auto mt-1 h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MembersListSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
