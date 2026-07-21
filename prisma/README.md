# Database Schema Documentation

## Overview

Family Finance uses **PostgreSQL** hosted on **Supabase** with **Prisma 7** as the ORM.

## Quick Start

```bash
# Generate Prisma Client (after schema changes)
pnpm db:generate

# Push schema to database (without migrations - dev only)
pnpm db:push

# Create and run migration (recommended for production)
pnpm db:migrate

# Seed database with sample data
pnpm db:seed

# Open Prisma Studio (database GUI)
pnpm db:studio

# Reset database (WARNING: deletes all data)
pnpm db:reset
```

## Connection Setup

Prisma 7 uses an **adapter pattern** for database connections. Connection strings are **not** in `schema.prisma` but in `src/lib/prisma.ts`.

### Environment Variables

```env
# Connection pooling (for serverless - use in production)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"

# Direct connection (for migrations - bypasses pgBouncer)
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

**Important:** Use `DATABASE_URL` for queries, `DIRECT_URL` for migrations.

## Schema Overview

### Core Entities

| Model | Description | Key Relations |
|---|---|---|
| **User** | Authentication and profile | → FamilyMember, Transaction, Notification |
| **Family** | Family group container | → FamilyMember, Transaction, Budget, etc. |
| **FamilyMember** | Junction table (User ↔ Family) | Role-based access (Admin/Parent/Child) |
| **Category** | Transaction categories | Both income and expense types |
| **Transaction** | Income/expense records | → User, Family, Category |
| **Budget** | Monthly spending limits | → Family, Category |
| **SavingsGoal** | Savings targets | → Family |
| **Bill** | Recurring bills | → Family |
| **RecurringTransaction** | Transaction templates | → Family, Category |
| **Notification** | In-app notifications | → User |
| **UserSettings** | User preferences | → User (1:1) |

### NextAuth.js Tables

- `Account` — OAuth provider accounts
- `Session` — Active sessions
- `VerificationToken` — Email verification tokens

## Key Design Decisions

### 1. UUID Primary Keys

All tables use `@default(uuid())` instead of auto-increment integers for:
- Better privacy (no sequential ID leakage)
- Easier distributed systems / sharding
- Works well with Supabase's Row Level Security

### 2. Soft Deletes

Critical tables include `deletedAt` timestamp:
- `User`, `Family`, `Transaction`
- Enables audit trails and data recovery
- Queries should filter `WHERE deletedAt IS NULL`

### 3. Money as Decimal

All monetary values use `Decimal @db.Decimal(19, 4)`:
- Avoids floating-point precision errors
- Supports up to 999,999,999,999,999.9999
- Maps to PostgreSQL `NUMERIC` type

### 4. Denormalized Fields

Some fields are denormalized for performance:
- `Budget.spent` — Pre-calculated from transactions
- Update via scheduled job or trigger

### 5. Indexes

Strategic indexes for common queries:
```prisma
// Composite index for filtered lists
@@index([familyId, date(sort: Desc)])

// Unique constraint for business logic
@@unique([familyId, userId])
```

## Enums

### Role
- `ADMIN` — Full family access (owner)
- `PARENT` — Can manage finances (co-admin)
- `CHILD` — View-only + personal transactions

### TransactionType
- `INCOME` — Money in
- `EXPENSE` — Money out

### BudgetPeriod
- `WEEKLY`, `MONTHLY`, `YEARLY`

### BillStatus
- `UPCOMING` — Not yet due
- `OVERDUE` — Past due date
- `PAID` — Marked as completed

### NotificationType
- `BUDGET_WARNING` — 80% threshold
- `BUDGET_EXCEEDED` — 100% threshold
- `BILL_REMINDER` — X days before due
- `BILL_OVERDUE` — Past due
- `SAVINGS_MILESTONE` — Goal milestone reached
- `SAVINGS_COMPLETED` — 100% complete

### RecurrenceFrequency
- `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`

## Relationships

### One-to-Many
- `Family` → `FamilyMember[]`
- `Family` → `Transaction[]`
- `User` → `Transaction[]`
- `Category` → `Transaction[]`

### Many-to-Many
- `User` ↔ `Family` (via `FamilyMember` junction table)

### One-to-One
- `User` → `UserSettings` (optional)

## Sample Queries

### Get family transactions for current month

```ts
const transactions = await prisma.transaction.findMany({
  where: {
    familyId: "family-uuid",
    date: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
    deletedAt: null, // Exclude soft-deleted
  },
  include: {
    category: true,
    user: { select: { name: true, image: true } },
  },
  orderBy: { date: "desc" },
})
```

### Calculate budget spent (manual approach)

```ts
const spent = await prisma.transaction.aggregate({
  where: {
    familyId: "family-uuid",
    categoryId: "category-uuid",
    type: "EXPENSE",
    date: {
      gte: budget.startDate,
      lte: budget.endDate,
    },
    deletedAt: null,
  },
  _sum: { amount: true },
})

const spentAmount = spent._sum.amount ?? 0
```

### Get family members with roles

```ts
const members = await prisma.familyMember.findMany({
  where: {
    familyId: "family-uuid",
    isActive: true,
  },
  include: {
    user: {
      select: { id: true, name: true, email: true, image: true },
    },
  },
  orderBy: { role: "asc" }, // Admin first
})
```

## Migrations

### Development Workflow

1. **Modify schema** — Edit `prisma/schema.prisma`
2. **Generate migration** — `pnpm db:migrate` (creates SQL file in `prisma/migrations/`)
3. **Review SQL** — Check generated SQL before applying
4. **Apply migration** — Automatically applied by step 2
5. **Generate client** — Automatically run after migration

### Production Workflow

1. **Test migration locally** — Run `pnpm db:migrate` in dev
2. **Commit migration files** — Add `prisma/migrations/` to Git
3. **Deploy** — Run `pnpm db:migrate:deploy` in production

**Important:** Always use `DIRECT_URL` for migrations (bypasses connection pooler).

## Seed Data

The seed script creates:
- 3 test users (ruby@example.com, juan@example.com, maria@example.com)
- 1 family ("Keluarga Padilla")
- 12 default categories (income + expense)
- 21 sample transactions (last 30 days)
- 2 budgets (food, transport)
- 2 savings goals
- 3 bills

**Test credentials:**
- Email: `ruby@example.com`
- Password: `password123`

Run: `pnpm db:seed`

## Known Issues & Future Work

### Milestone 2
- [ ] **Connection pooling** — Test with Supabase pgBouncer in production
- [ ] **Migration adapter** — Resolve `prisma.config.ts` for migration connection
- [ ] **Triggers** — Consider PostgreSQL trigger for auto-updating `Budget.spent`
- [ ] **Full-text search** — Add `@@fulltext` index on transaction descriptions

### Performance Optimization (Milestone 19)
- [ ] Add materialized view for monthly summaries
- [ ] Index optimization based on query patterns
- [ ] Consider partitioning for large transaction tables

## References

- [Prisma 7 Documentation](https://www.prisma.io/docs)
- [Prisma Adapter Pattern](https://pris.ly/d/prisma7-client-config)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [PostgreSQL Decimal Type](https://www.postgresql.org/docs/current/datatype-numeric.html)
