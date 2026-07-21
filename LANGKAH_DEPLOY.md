# 🚀 LANGKAH-LANGKAH DEPLOY - FAMILY FINANCE

## ✅ STATUS SEKARANG
- ✅ Code sudah di-commit ke Git (143 files)
- ✅ Build sudah success (23 routes)
- ✅ Siap push ke GitHub dan deploy ke Vercel!

---

## 📋 YANG PERLU ANDA LAKUKAN SEKARANG:

### STEP 1: Buat Repository di GitHub (5 menit)

1. **Buka browser, pergi ke:** https://github.com
2. **Login** dengan akun GitHub Anda
3. **Klik tombol hijau "New"** atau tombol **"+"** di kanan atas → pilih **"New repository"**

4. **Isi form repository:**
   ```
   Repository name: family-finance
   Description: Family Finance Management App - Track income, expenses, budgets, savings, and bills
   Visibility: ✅ Private (recommended untuk data finansial keluarga)
   ```

5. **JANGAN centang:**
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

6. **Klik "Create repository"**

7. **Copy URL repository Anda** (akan muncul di halaman selanjutnya):
   ```
   https://github.com/YOUR-USERNAME/family-finance.git
   ```
   
   **Contoh:** `https://github.com/johndoe/family-finance.git`

---

### STEP 2: Push Code ke GitHub (2 menit)

Setelah dapat URL repository, buka **terminal/command prompt** di folder project ini, lalu jalankan **3 command** ini:

```bash
# 1. Tambahkan remote (ganti YOUR-USERNAME dengan username GitHub Anda!)
git remote add origin https://github.com/YOUR-USERNAME/family-finance.git

# 2. Verifikasi remote sudah tersimpan
git remote -v

# 3. Push code ke GitHub
git push -u origin master
```

**Contoh lengkap dengan username "johndoe":**
```bash
git remote add origin https://github.com/johndoe/family-finance.git
git remote -v
git push -u origin master
```

**Tunggu ~1-2 menit** untuk upload semua file.

**Selesai!** Refresh halaman GitHub → code Anda sudah muncul! 🎉

---

### STEP 3: Deploy ke Vercel (10 menit)

#### A. Import Project

1. **Buka:** https://vercel.com
2. **Login** (bisa pakai akun GitHub yang sama)
3. **Klik "Add New..."** → **"Project"**
4. **Klik "Import Git Repository"**
5. **Connect GitHub** jika belum (klik "Connect" → authorize Vercel)
6. **Cari dan pilih** repository **"family-finance"**
7. **Klik "Import"**

#### B. Configure Project (PENTING!)

Vercel akan auto-detect Next.js settings. **Yang perlu Anda atur:**

1. **Framework Preset:** Next.js ✅ (sudah auto-detected)
2. **Root Directory:** `./` ✅ (default)
3. **Build Command:** `pnpm build` ✅ (auto-detected)
4. **Install Command:** `pnpm install` ✅ (auto-detected)

#### C. Environment Variables (SANGAT PENTING!)

**Klik "Environment Variables"** dan tambahkan **6 variables** ini satu per satu:

```env
# 1. DATABASE_URL (dari Supabase - lihat STEP 4)
DATABASE_URL = postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true&connection_limit=10

# 2. DIRECT_URL (dari Supabase - lihat STEP 4)
DIRECT_URL = postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# 3. AUTH_SECRET (generate baru!)
AUTH_SECRET = [Generate dengan command: openssl rand -base64 32]

# 4. AUTH_GOOGLE_ID (dari Google Cloud Console - lihat STEP 5)
AUTH_GOOGLE_ID = your-google-client-id.apps.googleusercontent.com

# 5. AUTH_GOOGLE_SECRET (dari Google Cloud Console - lihat STEP 5)
AUTH_GOOGLE_SECRET = your-google-client-secret

# 6. NEXT_PUBLIC_APP_URL (akan dapat setelah deploy pertama)
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

**CATATAN:** 
- Untuk sekarang, skip dulu `DATABASE_URL`, `DIRECT_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, dan `NEXT_PUBLIC_APP_URL`
- **Yang WAJIB sekarang:** Tambahkan `AUTH_SECRET` dulu
- Generate dengan command: `openssl rand -base64 32` (di terminal)
- Copy hasilnya ke Vercel

#### D. Deploy Pertama

1. **Klik "Deploy"**
2. **Tunggu ~2-3 menit** (Vercel akan build project Anda)
3. Jika berhasil: **"Congratulations!"** 🎉

**Copy URL deployment Anda:**
```
https://family-finance-xxxx.vercel.app
```

---

### STEP 4: Setup Supabase Database (15 menit)

#### A. Buat Project Supabase

1. **Buka:** https://supabase.com
2. **Login/Sign up** (bisa pakai GitHub)
3. **Klik "New project"**
4. **Isi form:**
   ```
   Name: family-finance-prod
   Database Password: [Buat password kuat - SIMPAN INI!]
   Region: Southeast Asia (Singapore) - terdekat dengan Indonesia
   Pricing Plan: Free
   ```
5. **Klik "Create new project"**
6. **Tunggu ~2 menit** sampai project ready

#### B. Get Connection Strings

1. Di Supabase dashboard → **Settings** (gear icon) → **Database**
2. Scroll ke bawah sampai section **"Connection string"**
3. **Pilih tab "URI"**

**Ada 2 connection strings yang perlu dicopy:**

**Connection string 1 - Transaction pooler (untuk DATABASE_URL):**
```
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Connection string 2 - Session mode (untuk DIRECT_URL):**
```
postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**PENTING:** 
- Ganti `[YOUR-PASSWORD]` dengan password database yang Anda buat di step A
- Port 6543 = Transaction pooler (DATABASE_URL)
- Port 5432 = Session mode (DIRECT_URL)

#### C. Update Vercel Environment Variables

1. **Kembali ke Vercel** → Project → **Settings** → **Environment Variables**
2. **Add/Update 2 variables:**
   - `DATABASE_URL` = connection string 1 (port 6543)
   - `DIRECT_URL` = connection string 2 (port 5432)
3. **Klik "Save"**

#### D. Push Database Schema

**Pilih salah satu cara:**

**CARA 1: Dari Local (Recommended)**

Buka terminal di folder project, jalankan:

```bash
# Set environment variables (Windows CMD)
set DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
set DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

# Push schema
pnpm exec prisma db push

# Seed initial data (optional - untuk data contoh)
pnpm db:seed
```

**CARA 2: Auto-generate saat Redeploy Vercel**

1. Vercel → **Deployments** tab
2. Klik **"..." (menu)** pada deployment terakhir
3. Klik **"Redeploy"**
4. Schema akan auto-generate saat build

---

### STEP 5: Setup Google OAuth (15 menit)

#### A. Google Cloud Console

1. **Buka:** https://console.cloud.google.com
2. **Login** dengan akun Google Anda
3. **Pilih/Buat project:**
   - Jika sudah ada project: pilih dari dropdown
   - Jika belum: klik "New Project" → beri nama "Family Finance" → Create

4. **Enable Google+ API:**
   - Sidebar → **APIs & Services** → **Library**
   - Search: "Google+ API"
   - Klik → **Enable**

5. **Configure OAuth Consent Screen:**
   - Sidebar → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Create
   - Isi form:
     ```
     App name: Family Finance
     User support email: [email Anda]
     Developer contact: [email Anda]
     ```
   - Klik **Save and Continue** → **Save and Continue** → **Back to Dashboard**

6. **Create OAuth Credentials:**
   - Sidebar → **APIs & Services** → **Credentials**
   - Klik **"+ CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**
   - Application type: **Web application**
   - Name: `Family Finance Production`
   
   **Authorized JavaScript origins:**
   ```
   https://family-finance-xxxx.vercel.app
   ```
   (ganti dengan URL Vercel Anda yang sebenarnya)
   
   **Authorized redirect URIs:**
   ```
   https://family-finance-xxxx.vercel.app/api/auth/callback/google
   ```
   (ganti dengan URL Vercel Anda + `/api/auth/callback/google`)

7. **Klik "CREATE"**
8. **Copy credentials yang muncul:**
   - **Client ID:** `xxxxx.apps.googleusercontent.com`
   - **Client secret:** `GOCSPX-xxxxx`

#### B. Update Vercel Environment Variables

1. **Vercel** → Settings → **Environment Variables**
2. **Add/Update 3 variables:**
   - `AUTH_GOOGLE_ID` = Client ID dari step A
   - `AUTH_GOOGLE_SECRET` = Client secret dari step A
   - `NEXT_PUBLIC_APP_URL` = `https://family-finance-xxxx.vercel.app`
3. **Klik "Save"**

#### C. Redeploy

1. Vercel → **Deployments** tab
2. Klik **"..."** pada deployment terakhir
3. Klik **"Redeploy"**
4. **Tunggu ~2-3 menit**

---

### STEP 6: Test Production App! (5 menit)

#### A. Health Check

**Buka di browser:**
```
https://your-app.vercel.app/api/health
```

**Should return:**
```json
{
  "status": "ok",
  "timestamp": "2026-...",
  "database": "connected"
}
```

✅ = Database connected!  
❌ = Check environment variables

#### B. Test Critical Features

1. **Buka:** `https://your-app.vercel.app`
2. **Register** → Buat akun baru dengan email & password
3. **Login** → Login dengan akun yang baru dibuat
4. **Test Google OAuth:**
   - Logout
   - Klik "Sign in with Google"
   - Should redirect dan login sukses
5. **Dashboard** → Should load dengan stats
6. **Create Transaction:**
   - Sidebar → Transaksi → + Tambah
   - Buat transaksi income/expense
   - Should save successfully
7. **Create Budget:**
   - Sidebar → Anggaran → + Tambah
   - Buat budget untuk kategori
   - Should show progress bar
8. **Check Notifications:**
   - Klik bell icon di header
   - Should show notification dropdown

**Jika semua test pass:** 🎉 **PRODUCTION READY!**

---

## 🎊 SELAMAT! APLIKASI SUDAH LIVE!

**Share URL ke keluarga:**
```
https://your-app.vercel.app
```

**Login credentials:** Pakai 1 akun untuk semua anggota keluarga! 👨‍👩‍👧‍👦

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard

**Monitor:**
- **Analytics:** Page views, performance metrics
- **Functions:** Server logs, errors
- **Deployments:** History of all deploys

### Supabase Dashboard

**Monitor:**
- **Database:** Size, connections, queries
- **Reports:** Performance metrics
- **Backups:** Auto-backup daily (Free tier)

---

## 💰 Biaya

**Sekarang (Free Tier):**
- Vercel Hobby: **$0/bulan** ✅
- Supabase Free: **$0/bulan** ✅
  - 500MB database
  - 2GB bandwidth
  - Unlimited API requests
- **Total: FREE!** 🎉

**Saat user bertambah (Production):**
- Vercel Pro: **$20/bulan** (unlimited bandwidth, better performance)
- Supabase Pro: **$25/bulan** (8GB database, better support)
- **Total: ~$45/bulan**

---

## 🔧 Troubleshooting

### Build Failed di Vercel

**Check:**
1. Vercel → Deployments → Klik deployment yang failed → Lihat logs
2. Common issues:
   - Missing environment variable → Add di Settings
   - TypeScript error → Fix di local, push lagi

### Database Connection Error

**Check:**
1. Vercel → Settings → Environment Variables
2. Verify `DATABASE_URL` dan `DIRECT_URL` correct
3. Test connection: buka `/api/health` endpoint

### Google OAuth Not Working

**Check:**
1. Google Cloud Console → Credentials
2. Verify **Authorized redirect URIs** match exactly:
   ```
   https://your-actual-domain.vercel.app/api/auth/callback/google
   ```
   (no trailing slash, must match your actual Vercel URL)

3. Verify environment variables:
   - `AUTH_GOOGLE_ID` correct
   - `AUTH_GOOGLE_SECRET` correct
   - `NEXT_PUBLIC_APP_URL` match your Vercel URL

---

## 🚀 Next Steps (Optional)

### 1. Custom Domain

**Jika mau domain sendiri** (misal: `keluargaku.com`):

1. **Beli domain:** Namecheap, GoDaddy, Cloudflare (~$10/tahun)
2. **Connect ke Vercel:**
   - Vercel → Settings → **Domains**
   - Add domain
   - Update DNS records di domain registrar
3. **Update environment variables:**
   - `NEXT_PUBLIC_APP_URL` = `https://keluargaku.com`
4. **Update Google OAuth redirect URI** ke domain baru

### 2. Email Notifications

**Setup Resend** (transactional email):

1. **Sign up:** https://resend.com
2. **Get API key:** Dashboard → API Keys
3. **Add to Vercel:**
   - Settings → Environment Variables
   - `RESEND_API_KEY` = your-api-key
4. **Redeploy**

Fitur email:
- Reminder tagihan jatuh tempo
- Notifikasi budget warning (80%, 100%)
- Summary bulanan

### 3. Mobile PWA

**Already configured!** Tinggal:

1. **Buka app di mobile browser**
2. **Chrome/Safari:** Klik menu → "Add to Home Screen"
3. **App akan install seperti native app!**

---

## 📝 Backup & Security

### Database Backups

**Supabase Free:** Auto-backup daily (7 days retention) ✅

**Manual backup:**
```bash
pnpm exec prisma db pull
```

### Security Best Practices

✅ **Sudah diimplementasi:**
- HTTPS only (Vercel auto)
- Environment variables di Vercel (encrypted)
- Bcrypt password hashing
- Auth.js session management
- CSRF protection
- Input validation (Zod)

⚠️ **Recommended tambahan:**
- Enable 2FA di GitHub account
- Enable 2FA di Vercel account
- Regular password rotation
- Monitor Vercel analytics untuk suspicious activity

---

## 📞 Butuh Bantuan?

**Jika ada error:**

1. **Check logs:**
   - Vercel: Deployments → Function Logs
   - Supabase: Dashboard → Logs

2. **Common fixes:**
   - Redeploy di Vercel
   - Verify all environment variables
   - Check database connection
   - Clear browser cache

3. **Still stuck?**
   - Vercel docs: https://vercel.com/docs
   - Supabase docs: https://supabase.com/docs
   - Next.js docs: https://nextjs.org/docs

---

## ✅ CHECKLIST DEPLOYMENT

Centang saat sudah selesai:

- [ ] 1. Buat repository di GitHub
- [ ] 2. Push code ke GitHub (`git push`)
- [ ] 3. Import project ke Vercel
- [ ] 4. Add environment variable: `AUTH_SECRET`
- [ ] 5. Deploy pertama kali
- [ ] 6. Buat project di Supabase
- [ ] 7. Copy connection strings
- [ ] 8. Update Vercel: `DATABASE_URL`, `DIRECT_URL`
- [ ] 9. Push database schema (`prisma db push`)
- [ ] 10. Setup Google OAuth credentials
- [ ] 11. Update Vercel: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_APP_URL`
- [ ] 12. Redeploy Vercel
- [ ] 13. Test `/api/health` endpoint
- [ ] 14. Test register & login
- [ ] 15. Test Google OAuth
- [ ] 16. Test create transaction
- [ ] 17. Test create budget
- [ ] 18. Test notifications
- [ ] 19. Share URL ke keluarga! 🎉

---

**Happy tracking your family finances!** 💰✨

**Selamat mengatur keuangan keluarga!** 💰✨

