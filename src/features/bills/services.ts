import { prisma } from "@/lib/prisma"
import type { BillStatus } from "@prisma/client"

// =============================================================================
// SERVICES
// =============================================================================

export async function getBills(familyId: string) {
  const bills = await prisma.bill.findMany({
    where: {
      familyId,
    },
    orderBy: [
      { isPaid: "asc" },
      { dueDate: "asc" },
    ],
  })

  return bills
}

export async function getBillById(id: string, familyId: string) {
  const bill = await prisma.bill.findFirst({
    where: {
      id,
      familyId,
    },
  })

  return bill
}

export async function getBillStats(familyId: string) {
  const bills = await prisma.bill.findMany({
    where: {
      familyId,
    },
  })

  const total = bills.length
  const upcoming = bills.filter((b) => b.status === "UPCOMING").length
  const overdue = bills.filter((b) => b.status === "OVERDUE").length
  const paid = bills.filter((b) => b.status === "PAID").length

  const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount), 0)
  const upcomingAmount = bills
    .filter((b) => b.status === "UPCOMING")
    .reduce((sum, b) => sum + Number(b.amount), 0)
  const overdueAmount = bills
    .filter((b) => b.status === "OVERDUE")
    .reduce((sum, b) => sum + Number(b.amount), 0)
  const paidAmount = bills
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + Number(b.amount), 0)

  return {
    total,
    upcoming,
    overdue,
    paid,
    totalAmount,
    upcomingAmount,
    overdueAmount,
    paidAmount,
  }
}

export async function getUpcomingBills(familyId: string, limit = 5) {
  const bills = await prisma.bill.findMany({
    where: {
      familyId,
      isPaid: false,
    },
    orderBy: {
      dueDate: "asc",
    },
    take: limit,
  })

  return bills
}

export async function updateBillStatuses(familyId: string) {
  // Get all unpaid bills
  const bills = await prisma.bill.findMany({
    where: {
      familyId,
      isPaid: false,
    },
  })

  const now = new Date()

  // Update status for each bill
  for (const bill of bills) {
    const dueDate = new Date(bill.dueDate)
    let newStatus: BillStatus = "UPCOMING"

    if (dueDate < now) {
      newStatus = "OVERDUE"
    }

    // Only update if status changed
    if (bill.status !== newStatus) {
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: newStatus },
      })
    }
  }
}
