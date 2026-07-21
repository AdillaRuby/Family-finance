import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { requireAuth } from "@/features/auth/utils"
import { getBills, getBillStats } from "@/features/bills/services"
import { BillCard } from "@/features/bills/components/bill-card"
import { formatCurrency } from "@/utils/format"

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export default async function BillsPage() {
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
          <h1 className="text-3xl font-bold">Tagihan</h1>
          <p className="text-muted-foreground">Kelola tagihan rutin dan pembayaran Anda</p>
        </div>
        <Button asChild>
          <Link href="/bills/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tagihan Baru
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards familyId={user.familyId} />
      </Suspense>

      <Suspense fallback={<BillsListSkeleton />}>
        <BillsList familyId={user.familyId} />
      </Suspense>
    </div>
  )
}

// =============================================================================
// STATS CARDS
// =============================================================================

async function StatsCards({ familyId }: { familyId: string }) {
  const stats = await getBillStats(familyId)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
          <Receipt className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-muted-foreground text-xs">{formatCurrency(stats.totalAmount)} total</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mendatang</CardTitle>
          <Clock className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcoming}</div>
          <p className="text-muted-foreground text-xs">{formatCurrency(stats.upcomingAmount)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
          <AlertCircle className="text-destructive h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-2xl font-bold">{stats.overdue}</div>
          <p className="text-muted-foreground text-xs">{formatCurrency(stats.overdueAmount)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lunas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.paid}</div>
          <p className="text-muted-foreground text-xs">{formatCurrency(stats.paidAmount)}</p>
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
// BILLS LIST
// =============================================================================

async function BillsList({ familyId }: { familyId: string }) {
  const bills = await getBills(familyId)

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Belum Ada Tagihan</h3>
          <p className="text-muted-foreground mb-6 text-center text-sm">
            Mulai lacak pembayaran tagihan rutin Anda dengan membuat tagihan pertama
          </p>
          <Button asChild>
            <Link href="/bills/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Buat Tagihan Pertama
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const upcomingBills = bills.filter((b) => b.status === "UPCOMING")
  const overdueBills = bills.filter((b) => b.status === "OVERDUE")
  const paidBills = bills.filter((b) => b.status === "PAID")

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">Semua ({bills.length})</TabsTrigger>
        <TabsTrigger value="upcoming">Mendatang ({upcomingBills.length})</TabsTrigger>
        <TabsTrigger value="overdue">Terlambat ({overdueBills.length})</TabsTrigger>
        <TabsTrigger value="paid">Lunas ({paidBills.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-4">
        {upcomingBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">Tidak ada tagihan mendatang</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="overdue" className="space-y-4">
        {overdueBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="mb-4 h-12 w-12 text-green-500" />
              <p className="text-muted-foreground">Tidak ada tagihan terlambat</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="paid" className="space-y-4">
        {paidBills.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">Belum ada tagihan yang dibayar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function BillsListSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-10 w-80" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
