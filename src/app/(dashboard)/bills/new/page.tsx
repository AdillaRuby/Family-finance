import { requireAuth } from "@/features/auth/utils"
import { BillForm } from "@/features/bills/components/bill-form"

export default async function NewBillPage() {
  await requireAuth()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tagihan Baru</h1>
        <p className="text-muted-foreground">Buat tagihan baru untuk pelacakan pembayaran</p>
      </div>

      <BillForm />
    </div>
  )
}
