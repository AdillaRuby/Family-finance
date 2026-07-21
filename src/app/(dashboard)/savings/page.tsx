import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, Target, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { requireAuth } from "@/features/auth/utils"
import { getSavingsGoals, getSavingsStats } from "@/features/savings/services"
import { SavingsGoalCard } from "@/features/savings/components/savings-goal-card"
import { formatCurrency } from "@/utils/format"

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function SavingsPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tabungan</h1>
          <p className="text-muted-foreground">Kelola tujuan tabungan keluarga Anda</p>
        </div>
        <Button asChild>
          <Link href="/savings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tujuan Baru
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards familyId={user.familyId} />
      </Suspense>

      <Suspense fallback={<SavingsGoalsListSkeleton />}>
        <SavingsGoalsList familyId={user.familyId} />
      </Suspense>
    </div>
  )
}

// =============================================================================
// STATS CARDS
// =============================================================================

async function StatsCards({ familyId }: { familyId: string }) {
  const stats = await getSavingsStats(familyId)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tujuan</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {stats.active} aktif, {stats.completed} selesai
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Target</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalTarget)}</div>
          <p className="text-xs text-muted-foreground">Semua tujuan tabungan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Terkumpul</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalSaved)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.overallProgress.toFixed(1)}% dari target
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sisa Target</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRemaining)}</div>
          <p className="text-xs text-muted-foreground">Untuk mencapai semua tujuan</p>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="mt-1 h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// =============================================================================
// SAVINGS GOALS LIST
// =============================================================================

async function SavingsGoalsList({ familyId }: { familyId: string }) {
  const goals = await getSavingsGoals(familyId)

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">Belum Ada Tujuan Tabungan</h3>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Mulai menabung untuk impian Anda dengan membuat tujuan tabungan pertama
          </p>
          <Button asChild>
            <Link href="/savings/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Tujuan Pertama
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Tujuan Tabungan</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <SavingsGoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  )
}

function SavingsGoalsListSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
