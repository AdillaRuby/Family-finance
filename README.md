# Family Finance

> **Kelola keuangan keluarga dengan mudah** — Catat pemasukan, pengeluaran, budget, tabungan, dan tagihan bersama keluarga.

Aplikasi web modern untuk manajemen keuangan keluarga, dibangun dengan Next.js 15+ (App Router), TypeScript, Prisma, dan Supabase PostgreSQL.

---

## Status Project

**Milestone 1 ✓ Completed** — Project initialization, configuration, folder structure, and core UI components.

**Milestone 2 ✓ Completed** — Complete database schema with Prisma 7, seed data, and documentation.

**Milestone 3 ✓ Completed** — Authentication (Auth.js, credentials, Google OAuth, RBAC, protected routes).

**Milestone 4 ✓ Completed** — Application layout (Sidebar, Header, Breadcrumb, Theme toggle, User menu, Dark mode).

**Milestone 5 ✓ Completed** — Dashboard with real data (Stats cards, Trends chart, Recent transactions, Loading states).

**Milestone 6 ✓ Completed** — Transactions CRUD (Add, Edit, Delete, List with summary cards, Real-time updates).

**Milestone 7 ✓ Completed** — Income & Expenses pages (Analytics, Category breakdown, Growth tracking, Projections).

**Milestone 8 ✓ Completed** — Budgets (Create, Edit, Delete, Real-time tracking, Status alerts, Progress bars).

**Milestone 9 ✓ Completed** — Savings Goals (Create, Edit, Delete, Add/Withdraw savings, Progress tracking, Milestone notifications).

**Milestone 10 ✓ Completed** — Bills (Create, Edit, Delete, Recurring bills, Payment tracking, Status alerts, Reminders).

**Milestone 11 ✓ Completed** — Reports & Analytics (Financial summary, Category breakdown, Monthly trends, Budget performance, Savings progress).

**Milestone 12 ✓ Completed** — Family Members (View members, Role management, Activity tracking, Access control, Member status management).

**Milestone 13 ✓ Completed** — Notifications (Mark as read, Delete, Type-based filtering, Action links).

**Milestone 14 ✓ Completed** — Settings (Profile update, Password change, Preferences, Theme/Language/Currency).

**Milestone 15 ✓ Completed** — AI Financial Insights (Rule-based analysis, Spending trends, Budget alerts, Savings recommendations).

See [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Icons | Lucide React |
| Animation | Framer Motion |
| State | Zustand |
| Data Fetching | TanStack Query |
| Validation | Zod |
| Forms | React Hook Form |
| Charts | Recharts |
| Date | date-fns |
| Auth | Auth.js (NextAuth v5) |
| ORM | Prisma 7 |
| Database | Supabase PostgreSQL |
| File Upload | UploadThing |
| Email | Resend + React Email |
| Notifications | Sonner |
| Testing | Vitest + Playwright |
| Deployment | Vercel |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js 20.9+ (LTS)
- pnpm 11+
- Supabase account (or local PostgreSQL)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd family-finance
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local` — see `.env.example` for required values.

5. Generate Prisma Client:
   ```bash
   pnpm exec prisma generate
   ```

6. Run the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format code with Prettier |
| `pnpm format:check` | Check code formatting |
| `pnpm typecheck` | Run TypeScript compiler check |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema to database (no migration) |
| `pnpm db:migrate` | Run database migrations (dev) |
| `pnpm db:migrate:deploy` | Deploy migrations (production) |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Reset database (⚠️ deletes all data) |

---

## Project Structure

```
family-finance/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication pages
│   │   ├── (dashboard)/          # Protected dashboard pages
│   │   └── api/                  # API routes
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── shared/               # Reusable cross-feature components
│   │   └── layout/               # Layout components (Sidebar, Header, etc.)
│   ├── features/                 # Feature-based modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Core utilities (Prisma, Auth config)
│   ├── services/                 # Data access layer (server-side)
│   ├── store/                    # Zustand stores
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Pure utility functions
│   ├── styles/                   # Global styles
│   ├── emails/                   # React Email templates
│   └── env.ts                    # Environment variable validation (Zod)
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed script
├── public/                       # Static assets
├── tests/                        # Test files
└── scripts/                      # Build/maintenance scripts
```

---

## Milestones

- [x] **Milestone 1** — Project initialization
- [x] **Milestone 2** — Database design
- [x] **Milestone 3** — Authentication
- [x] **Milestone 4** — Application layout
- [x] **Milestone 5** — Dashboard
- [x] **Milestone 6** — Transactions
- [x] **Milestone 7** — Income & Expenses
- [x] **Milestone 8** — Budgets
- [x] **Milestone 9** — Savings Goals
- [x] **Milestone 10** — Bills
- [x] **Milestone 11** — Reports
- [x] **Milestone 12** — Family Members
- [x] **Milestone 13** — Notifications
- [x] **Milestone 14** — Settings
- [x] **Milestone 15** — AI Financial Insights
- [x] **Milestone 16-17** — Skipped (Net Worth & PWA - can be added later)
- [x] **Milestone 18** — Testing Strategy Documented
- [x] **Milestone 19** — Performance Optimization
- [x] **Milestone 20** — Production Deployment Ready

---

## Design Philosophy

- **Less is more** — Minimal, generous whitespace, calm interfaces
- **Production quality** — Every feature is built as if it will serve millions
- **Accessibility first** — WCAG AA compliant, keyboard navigation, screen reader friendly
- **Performance** — Server Components by default, code splitting, image optimization
- **Security** — Input validation, role-based access, secure sessions

Design inspiration: Linear, Stripe Dashboard, Vercel, Notion, Arc Browser

---

## License

[MIT](./LICENSE)

---

## Production Deployment

This app is ready for production deployment! See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Production Checklist

- [x] Environment variable validation
- [x] Security headers configured
- [x] Health check endpoint (`/api/health`)
- [x] Database connection pooling
- [x] Image optimization (next/image)
- [x] Code splitting & lazy loading
- [x] Server action revalidation
- [x] Role-based access control
- [x] SQL injection prevention (Prisma ORM)
- [x] XSS prevention (React sanitization)
- [ ] SSL certificate (automatic with Vercel)
- [ ] Error tracking (Sentry recommended)
- [ ] Monitoring & logging

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for detailed checklist.

---

## Contributing

This project follows strict quality standards defined in the master specification. Every milestone must pass:

- ✓ TypeScript strict mode with no errors
- ✓ ESLint with no errors
- ✓ Responsive (mobile/tablet/desktop)
- ✓ Dark mode support
- ✓ Accessibility (WCAG AA)
- ✓ Loading/empty/error/success states
- ✓ Production-ready code

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed conventions.
