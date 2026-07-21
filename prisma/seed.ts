import { PrismaClient, Role, TransactionType, BudgetPeriod } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Clean existing data (dev only)
  await prisma.notification.deleteMany()
  await prisma.recurringTransaction.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.savingsGoal.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.category.deleteMany()
  await prisma.familyMember.deleteMany()
  await prisma.family.deleteMany()
  await prisma.userSettings.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log("✓ Cleaned existing data")

  // Create users
  const passwordHash = await hash("password123", 10)

  const user1 = await prisma.user.create({
    data: {
      name: "Ruby Padilla",
      email: "ruby@example.com",
      password: passwordHash,
      emailVerified: new Date(),
    },
  })

  const user2 = await prisma.user.create({
    data: {
      name: "Juan Padilla",
      email: "juan@example.com",
      password: passwordHash,
      emailVerified: new Date(),
    },
  })

  const user3 = await prisma.user.create({
    data: {
      name: "Maria Padilla",
      email: "maria@example.com",
      password: passwordHash,
      emailVerified: new Date(),
    },
  })

  console.log("✓ Created users")

  // Create family
  const family = await prisma.family.create({
    data: {
      name: "Keluarga Padilla",
      currency: "IDR",
    },
  })

  console.log("✓ Created family")

  // Add family members
  await prisma.familyMember.createMany({
    data: [
      { familyId: family.id, userId: user1.id, role: Role.ADMIN },
      { familyId: family.id, userId: user2.id, role: Role.PARENT },
      { familyId: family.id, userId: user3.id, role: Role.CHILD },
    ],
  })

  console.log("✓ Created family members")

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      // Income categories
      {
        familyId: family.id,
        name: "Gaji",
        type: TransactionType.INCOME,
        icon: "Briefcase",
        color: "#10b981",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Bonus",
        type: TransactionType.INCOME,
        icon: "Gift",
        color: "#8b5cf6",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Investasi",
        type: TransactionType.INCOME,
        icon: "TrendingUp",
        color: "#3b82f6",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Lainnya",
        type: TransactionType.INCOME,
        icon: "DollarSign",
        color: "#6b7280",
        isDefault: true,
      },

      // Expense categories
      {
        familyId: family.id,
        name: "Makanan & Minuman",
        type: TransactionType.EXPENSE,
        icon: "UtensilsCrossed",
        color: "#ef4444",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Transportasi",
        type: TransactionType.EXPENSE,
        icon: "Car",
        color: "#f59e0b",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Belanja",
        type: TransactionType.EXPENSE,
        icon: "ShoppingBag",
        color: "#ec4899",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Tagihan",
        type: TransactionType.EXPENSE,
        icon: "FileText",
        color: "#06b6d4",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Pendidikan",
        type: TransactionType.EXPENSE,
        icon: "GraduationCap",
        color: "#8b5cf6",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Kesehatan",
        type: TransactionType.EXPENSE,
        icon: "Heart",
        color: "#f43f5e",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Hiburan",
        type: TransactionType.EXPENSE,
        icon: "Sparkles",
        color: "#14b8a6",
        isDefault: true,
      },
      {
        familyId: family.id,
        name: "Lainnya",
        type: TransactionType.EXPENSE,
        icon: "MoreHorizontal",
        color: "#6b7280",
        isDefault: true,
      },
    ],
  })

  console.log("✓ Created categories")

  // Fetch created categories
  const incomeCategories = await prisma.category.findMany({
    where: { familyId: family.id, type: TransactionType.INCOME },
  })
  const expenseCategories = await prisma.category.findMany({
    where: { familyId: family.id, type: TransactionType.EXPENSE },
  })

  const salaryCategory = incomeCategories.find((c) => c.name === "Gaji")!
  const foodCategory = expenseCategories.find((c) => c.name === "Makanan & Minuman")!
  const transportCategory = expenseCategories.find((c) => c.name === "Transportasi")!
  const billsCategory = expenseCategories.find((c) => c.name === "Tagihan")!

  // Create transactions (last 30 days)
  const now = new Date()
  const transactions = []

  // Income: Monthly salary
  transactions.push({
    familyId: family.id,
    userId: user1.id,
    categoryId: salaryCategory.id,
    type: TransactionType.INCOME,
    amount: 15000000,
    description: "Gaji bulan ini",
    date: new Date(now.getFullYear(), now.getMonth(), 1),
  })

  // Expenses: Random for last 30 days
  for (let i = 0; i < 20; i++) {
    const randomCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
    const randomUser = [user1, user2, user3][Math.floor(Math.random() * 3)]!
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - randomDaysAgo)

    if (randomCategory) {
      transactions.push({
        familyId: family.id,
        userId: randomUser.id,
        categoryId: randomCategory.id,
        type: TransactionType.EXPENSE,
        amount: Math.floor(Math.random() * 500000) + 10000,
        description: `Pengeluaran ${randomCategory.name.toLowerCase()}`,
        date,
      })
    }
  }

  await prisma.transaction.createMany({ data: transactions })

  console.log("✓ Created transactions")

  // Create budgets
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  await prisma.budget.createMany({
    data: [
      {
        familyId: family.id,
        categoryId: foodCategory.id,
        amount: 3000000,
        spent: 1250000,
        period: BudgetPeriod.MONTHLY,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
      {
        familyId: family.id,
        categoryId: transportCategory.id,
        amount: 1500000,
        spent: 980000,
        period: BudgetPeriod.MONTHLY,
        startDate: startOfMonth,
        endDate: endOfMonth,
      },
    ],
  })

  console.log("✓ Created budgets")

  // Create savings goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        familyId: family.id,
        name: "Liburan ke Bali",
        targetAmount: 20000000,
        currentAmount: 8500000,
        deadline: new Date(now.getFullYear(), 11, 31),
      },
      {
        familyId: family.id,
        name: "Dana Darurat",
        targetAmount: 50000000,
        currentAmount: 22000000,
        deadline: null,
      },
    ],
  })

  console.log("✓ Created savings goals")

  // Create bills
  const nextMonth = new Date(now)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  await prisma.bill.createMany({
    data: [
      {
        familyId: family.id,
        name: "Listrik PLN",
        amount: 650000,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 20),
        status: "UPCOMING",
      },
      {
        familyId: family.id,
        name: "Internet Indihome",
        amount: 350000,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        status: "UPCOMING",
      },
      {
        familyId: family.id,
        name: "Asuransi Kesehatan",
        amount: 1200000,
        dueDate: nextMonth,
        status: "UPCOMING",
        isRecurring: true,
      },
    ],
  })

  console.log("✓ Created bills")

  // Create user settings
  await prisma.userSettings.createMany({
    data: [
      { userId: user1.id, theme: "system", language: "id", currency: "IDR" },
      { userId: user2.id, theme: "dark", language: "id", currency: "IDR" },
      { userId: user3.id, theme: "light", language: "id", currency: "IDR" },
    ],
  })

  console.log("✓ Created user settings")

  console.log("\n✅ Seed completed successfully!")
  console.log("\n📊 Summary:")
  console.log("   - Users: 3")
  console.log("   - Families: 1")
  console.log("   - Categories: 12")
  console.log("   - Transactions: 21")
  console.log("   - Budgets: 2")
  console.log("   - Savings Goals: 2")
  console.log("   - Bills: 3")
  console.log("\n👤 Test credentials:")
  console.log("   Email: ruby@example.com")
  console.log("   Password: password123")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
