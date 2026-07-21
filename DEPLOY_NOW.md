# 🚀 CARA DEPLOY KE PRODUCTION - FAMILY FINANCE

## ✅ STATUS: Siap Deploy!

Build sudah success, code sudah di-commit. Tinggal push ke GitHub dan deploy ke Vercel!

---

## STEP 1: Push ke GitHub

### A. Buat Repository Baru di GitHub

1. Buka [github.com](https://github.com)
2. Login dengan akun Anda
3. Click tombol **"+"** (kanan atas) → **"New repository"**
4. Isi form:
   - **Repository name:** `family-finance` (atau nama lain yang Anda mau)
   - **Description:** "Family Finance Management App - Track income, expenses, budgets, savings, and bills"
   - **Visibility:** 
     - **Private** ✅ (recommended untuk production)
     - atau **Public** (jika mau open source)
   - **JANGAN** centang: "Add README", "Add .gitignore", "Choose license"
5. Click **"Create repository"**

### B. Copy URL Repository

Setelah repo dibuat, Anda akan lihat halaman dengan command. Copy URL repo Anda:

```
https://github.com/YOUR-USERNAME/family-finance.git
```

### C. Push Code ke GitHub

Buka terminal di folder project ini, lalu jalankan:

```bash
# Tambahkan remote repository (ganti URL dengan URL repo Anda!)
git remote add origin https://github.com/YOUR-USERNAME/family-finance.git

# Push code ke GitHub
git push -u origin master
```

**Refresh halaman GitHub** → Code Anda sudah muncul! ✅

---

## STEP 2: Deploy ke Vercel

### A. Buka Vercel dan Import Project

1. Buka [vercel.com](https://vercel.com)
2. Login (bisa pakai GitHub account)
3. Click **"Add New..."** → **"Project"**
4. Pilih **"Import Git Repository"**
5. **Connect GitHub** (jika belum)
6. Pilih repository **"family-finance"**
7. Click **"Import"**

### B. Configure Project

**Framework Preset:** Next.js (auto-detected) ✅

**Root Directory:** `./` (default)

**Build Command:** `pnpm build` (auto-detected) ✅

**Output Directory:** `.next` (default) ✅

**Install Command:** `pnpm install` (auto-detected) ✅

### C. Environment Variables

Click **"Environment Variables"** dan tambahkan satu per satu:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true&connection_limit=10
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
AUTH_SECRET=[Generate dengan: openssl rand -base64 32]
AUTH_GOOGLE_ID=[Dari Google Cloud Console]
AUTH_GOOGLE_SECRET=[Dari Google Cloud Console]
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Important:**
- `DATABASE_URL` & `DIRECT_URL` → Dari Supabase (lihat Step 3)
- `AUTH_SECRET` → Generate baru untuk production! **JANGAN pakai yang sama dengan development!**
- `NEXT_PUBLIC_APP_URL` → Akan jadi URL Vercel Anda (bisa update nanti)

### D. Deploy!

Click **"Deploy"** → Tunggu ~2-3 menit

Jika berhasil: ✅ **"Congratulations! Your project has been deployed."**

---

## STEP 3: Setup Supabase Production Database

### A. Buat Project Baru di Supabase

1. Buka [supabase.com](https://supabase.com)
2. Login/Sign up
3. Click **"New project"**
4. Isi form:
   - **Name:** `family-finance-prod`
   - **Database Password:** Pilih password kuat (SIMPAN INI!)
   - **Region:** Pilih yang terdekat dengan user Anda (misal: Singapore)
   - **Pricing Plan:** Free (untuk start)
5. Click **"Create new project"**
6. Tunggu ~2 menit provisioning

### B. Get Connection Strings

1. Di Supabase dashboard → **Settings** → **Database**
2. Scroll ke **Connection string**
3. Pilih **"URI"** tab
4. Copy connection string (ada 2 jenis):

**Transaction Pooler (untuk DATABASE_URL):**
```
postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Session (untuk DIRECT_URL):**
```
postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

5. **Ganti `[YOUR-PASSWORD]`** dengan password database Anda!

### C. Push Schema ke Database

**Option 1: Dari Local Machine**

```bash
# Set environment variables sementara (Windows CMD)
set DATABASE_URL=your-production-database-url
set DIRECT_URL=your-production-direct-url

# Push schema
pnpm exec prisma db push

# (Optional) Seed data
pnpm db:seed
```

**Option 2: Dari Vercel Dashboard**

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add `DATABASE_URL` dan `DIRECT_URL`
3. Redeploy project → Schema akan auto-generate saat build

---

## STEP 4: Configure Google OAuth untuk Production

### A. Google Cloud Console

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Pilih project Anda (atau buat baru)
3. **APIs & Services** → **Credentials**
4. Click **"CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
5. **Application type:** Web application
6. **Authorized redirect URIs:**
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
   (Ganti `your-app` dengan actual domain Vercel Anda)
7. Click **"CREATE"**
8. Copy **Client ID** dan **Client secret**

### B. Update Vercel Environment Variables

1. Vercel Dashboard → Settings → Environment Variables
2. Edit/Add:
   - `AUTH_GOOGLE_ID` = Client ID dari step A
   - `AUTH_GOOGLE_SECRET` = Client secret dari step A
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`

### C. Redeploy

1. Vercel Dashboard → Deployments
2. Click "..." pada deployment terakhir → **"Redeploy"**

---

## STEP 5: Verifikasi Deployment

### A. Health Check

Buka: `https://your-app.vercel.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-...",
  "database": "connected"
}
```

✅ = All good!
❌ = Check environment variables & database connection

### B. Test Critical Flows

1. **Register** → Buat akun baru
2. **Login** → Login dengan kredensial
3. **Google OAuth** → Login dengan Google
4. **Dashboard** → Lihat dashboard (should load tanpa error)
5. **Create Transaction** → Tambah transaksi income/expense
6. **Check Budget** → Buat budget dan lihat tracking
7. **Notifications** → Check bell icon untuk notifikasi

If all pass: **🎉 PRODUCTION READY!**

---

## STEP 6: Custom Domain (Optional)

### A. Beli Domain

Beli domain dari:
- Namecheap (~$10/tahun)
- GoDaddy
- Google Domains
- Cloudflare

### B. Connect ke Vercel

1. Vercel Dashboard → Settings → **Domains**
2. Click **"Add"**
3. Masukkan domain Anda (misal: `familyfinance.com`)
4. Vercel akan beri instruksi DNS settings
5. Update DNS di domain registrar Anda:
   - Type: **A** → Value: `76.76.21.21`
   - Type: **CNAME** → Value: `cname.vercel-dns.com`
6. Tunggu propagasi (~1-24 jam)

### C. Update Environment Variables

```
NEXT_PUBLIC_APP_URL=https://familyfinance.com
```

Update **Google OAuth redirect URI** juga ke domain baru!

### D. Force HTTPS

Vercel automatically redirects HTTP to HTTPS ✅

---

## Troubleshooting

### Build Failed

**Error:** `Module not found`
**Fix:** Check `package.json` dependencies, run `pnpm install` locally

**Error:** `Environment variable not found`
**Fix:** Double check all env vars di Vercel dashboard

### Database Connection Failed

**Error:** `Can't reach database`
**Fix:** 
- Verify `DATABASE_URL` dan `DIRECT_URL` correct
- Check Supabase project is running
- Test connection dari local machine

### Google OAuth Not Working

**Error:** `Redirect URI mismatch`
**Fix:**
- Verify redirect URI di Google Cloud Console matches Vercel URL exactly
- Format: `https://your-app.vercel.app/api/auth/callback/google` (no trailing slash!)

### 500 Internal Server Error

**Check:**
1. Vercel logs → **Functions** tab
2. Look for error messages
3. Common issues:
   - Missing env variable
   - Database schema not pushed
   - Prisma client not generated (should auto-generate on build)

---

## Monitoring Production

### Vercel Analytics

1. Project → **Analytics** tab
2. Monitor:
   - Page views
   - Load times
   - Error rates
   - Geographic distribution

### Supabase Monitoring

1. Supabase Dashboard → **Reports**
2. Monitor:
   - Database size
   - Active connections
   - Query performance

---

## Biaya Estimasi

**Free Tier (untuk mulai):**
- Vercel Hobby: **Free** ✅
- Supabase Free: **Free** ✅ (500MB database, 2GB bandwidth)
- Domain: ~$10-15/tahun
- **Total: $0/bulan** (+ domain)

**Production (recommended setelah ada user):**
- Vercel Pro: **$20/bulan**
- Supabase Pro: **$25/bulan** (8GB database, better performance)
- Domain: ~$10-15/tahun
- **Total: ~$45/bulan**

---

## 🎉 SELAMAT!

Aplikasi Family Finance Anda sudah **LIVE** di internet!

Share ke keluarga:
```
https://your-app.vercel.app
```

**Satu akun untuk semua anggota keluarga!** 👨‍👩‍👧‍👦

---

## Next Steps

**Post-Launch:**
1. ✅ Test semua fitur di production
2. ✅ Monitor performance (Vercel Analytics)
3. ✅ Setup database backups (Supabase auto-backup daily)
4. ✅ Invite family members (share login credentials)

**Future Enhancements:**
- Add email notifications (Resend integration)
- Add multi-user invitation system
- Add data export (PDF/CSV)
- Add mobile PWA support
- Add more charts & analytics

**Happy tracking your family finances!** 💰✨
