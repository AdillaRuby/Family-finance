import { getCurrentUser } from "@/features/auth/utils"
import { redirect } from "next/navigation"
import { getCategoriesForFamily } from "@/features/transactions/services"
import { TransactionForm } from "@/features/transactions/components/transaction-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewTransactionPage() {
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  const categories = await getCategoriesForFamily(user.familyId)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/transactions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Transaksi
        </Link>
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tambah Transaksi Baru</CardTitle>
          <CardDescription>Catat pemasukan atau pengeluaran keluarga</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
