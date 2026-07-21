import { requireAuth } from "@/features/auth/utils"
import { getBillById } from "@/features/bills/services"
import { BillForm } from "@/features/bills/components/bill-form"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBillPage(props: PageProps) {
  const user = await requireAuth()
  const params = await props.params

  if (!user.familyId) {
    notFound()
  }

  const bill = await getBillById(params.id, user.familyId)

  if (!bill) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Tagihan</h1>
        <p className="text-muted-foreground">Ubah detail tagihan Anda</p>
      </div>

      <BillForm bill={bill} />
    </div>
  )
}
