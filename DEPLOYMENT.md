# Deployment Guide - Family Finance

## Prerequisites

- Vercel account
- Supabase project (production database)
- Google OAuth credentials (production)
- Domain name (optional)

---

## Step 1: Prepare Production Database

### 1.1 Create Supabase Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project (choose region closest to users)
3. Wait for provisioning (~2 minutes)
4. Go to Settings → Database
5. Copy **Connection string** (Transaction pooler recommended)
6. Copy **Direct connection string** (for migrations)

### 1.2 Apply Database Schema

From your local machine:

```bash
# Set production database URL temporarily
export DATABASE_URL="your-production-connection-string"
export DIRECT_URL="your-production-direct-connection-string"

# Generate Prisma Client
pnpm exec prisma generate

# Push schema to production database
pnpm exec prisma db push

# Or use migration (recommended for production)
pnpm exec prisma migrate deploy
```

---

## Step 2: Configure Google OAuth (Production)

### 2.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create new one
3. Go to **APIs & Services** → **Credentials**
4. Create **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `https://your-domain.vercel.app/api/auth/callback/google`
     - `https://your-custom-domain.com/api/auth/callback/google` (if using custom domain)
5. Copy **Client ID** and **Client Secret**

---

## Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Initial Deployment

```bash
# From project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: family-finance
# - In which directory? ./
# - Override settings? No
```

### 3.4 Set Environment Variables

Option A: Via Vercel Dashboard
1. Go to project → Settings → Environment Variables
2. Add all variables from `.env.local`:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=10
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
AUTH_SECRET=[Generate new with: openssl rand -base64 32]
AUTH_GOOGLE_ID=[From Google Cloud Console]
AUTH_GOOGLE_SECRET=[From Google Cloud Console]
NEXT_PUBLIC_APP_URL=https://family-finance.vercel.app
NODE_ENV=production
```

Option B: Via Vercel CLI

```bash
vercel env add DATABASE_URL
# Paste value when prompted

vercel env add DIRECT_URL
# ... repeat for all variables
```

### 3.5 Deploy to Production

```bash
vercel --prod
```

---

## Step 4: Post-Deployment Verification

### 4.1 Health Check

Visit: `https://your-domain.vercel.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-21T...",
  "database": "connected"
}
```

### 4.2 Test Critical Flows

1. **Homepage** → Should redirect to `/dashboard` or `/login`
2. **Register** → Create new account
3. **Login** → Sign in with credentials
4. **Google OAuth** → Sign in with Google
5. **Dashboard** → Should load without errors
6. **Create Transaction** → Add income/expense
7. **Budgets** → Create budget and verify tracking
8. **Settings** → Update profile

### 4.3 Performance Check

Run Lighthouse audit (Chrome DevTools):
- Performance: Target > 90
- Accessibility: Target > 95
- Best Practices: Target > 95
- SEO: Target > 90

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain in Vercel

1. Go to project → Settings → Domains
2. Add your domain (e.g., `familyfinance.com`)
3. Configure DNS records as instructed by Vercel

### 5.2 Update Environment Variables

```bash
# Update NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-custom-domain.com
```

### 5.3 Update Google OAuth

1. Go to Google Cloud Console → Credentials
2. Add new authorized redirect URI:
   - `https://your-custom-domain.com/api/auth/callback/google`

---

## Step 6: Monitoring & Maintenance

### 6.1 Setup Error Tracking (Optional)

**Sentry Integration:**

```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 6.2 Database Backups

Supabase automatically backs up your database daily. Verify:
1. Go to Supabase Dashboard → Database → Backups
2. Ensure daily backups are enabled

### 6.3 Monitor Performance

**Vercel Analytics:**
1. Go to project → Analytics
2. Monitor: Page views, load times, errors

**Supabase Monitoring:**
1. Go to Supabase → Reports
2. Monitor: Database size, connections, query performance

---

## Troubleshooting

### Build Fails

```bash
# Check build locally
pnpm build

# Common issues:
# - TypeScript errors → Fix in code
# - Missing env vars → Add to Vercel
# - Prisma client not generated → Add build command
```

### Database Connection Fails

```bash
# Verify connection string format
# Supabase pooler connection:
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=10

# For Prisma, use transaction pooler URL
# For migrations, use direct connection URL
```

### OAuth Not Working

1. Check authorized redirect URIs in Google Cloud Console
2. Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Vercel
3. Ensure `NEXT_PUBLIC_APP_URL` matches your domain
4. Check `AUTH_SECRET` is set (different from development!)

### 500 Internal Server Error

1. Check Vercel logs: `vercel logs`
2. Common causes:
   - Missing environment variable
   - Database connection failed
   - Prisma client not generated

---

## Rollback Strategy

### Rollback Deployment

```bash
# View deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Database Rollback

Supabase provides point-in-time recovery:
1. Go to Database → Backups
2. Select backup point
3. Restore database

---

## Production Checklist

Before going live, ensure:

- [ ] All environment variables set in Vercel
- [ ] Database schema deployed (migrations run)
- [ ] Google OAuth configured with production URLs
- [ ] Health check endpoint returns "ok"
- [ ] Test user registration and login
- [ ] Test Google OAuth login
- [ ] Create test transaction and verify dashboard
- [ ] Lighthouse score > 90 on all metrics
- [ ] No console errors in production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Security headers enabled (check next.config.ts)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Database backups verified
- [ ] Monitoring dashboards bookmarked

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Auth.js Docs**: https://authjs.dev

---

## Estimated Costs (Monthly)

- **Vercel Pro**: $20/month (recommended for production)
- **Supabase Pro**: $25/month (includes 8GB database + backups)
- **Domain**: ~$12/year
- **Total**: ~$45/month + domain

**Free Tier Option:**
- Vercel Hobby: Free (limited to personal use)
- Supabase Free: Free (500MB database, 2GB bandwidth)
- Total: $0/month (good for testing/MVP)
