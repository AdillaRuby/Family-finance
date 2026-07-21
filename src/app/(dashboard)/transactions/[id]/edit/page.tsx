import { getCurrentUser } from "@/features/auth/utils"
import { redirect, notFound } from "next/navigation"
import { getCategoriesForFamily, getTransactionById } from "@/features/transactions/services"
import { TransactionForm } from "@/features/transactions/components/transaction-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EditTransactionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user || !user.familyId) redirect("/login")

  const [transaction, categories] = await Promise.all([
    getTransactionById(user.familyId, id),
    getCategoriesForFamily(user.familyId),
  ])

  if (!transaction) {
    notFound()
  }

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
          <CardTitle>Edit Transaksi</CardTitle>
          <CardDescription>Perbarui detail transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionForm
            categories={categories}
            initialData={{
              id: transaction.id,
              type: transaction.type,
              categoryId: transaction.category.id,
              amount: transaction.amount,
              description: transaction.description || "",
              date: transaction.date,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
