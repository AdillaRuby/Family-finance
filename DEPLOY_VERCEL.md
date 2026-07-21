# 🚀 DEPLOY KE VERCEL - LANGKAH MUDAH

## ✅ STATUS: Code sudah di GitHub!

Repository: https://github.com/AdillaRuby/Family-finance.git

---

## 🎯 LANGKAH BERIKUTNYA: Deploy ke Vercel

### STEP 1: Import Project ke Vercel (5 menit)

1. **Buka:** https://vercel.com
2. **Login** (pakai akun GitHub "AdillaRuby" untuk auto-connect)
3. **Klik "Add New..."** (tombol di kanan atas) → **"Project"**
4. **Pilih "Import Git Repository"**
5. **Cari repository "Family-finance"** dari list
6. **Klik "Import"**

### STEP 2: Configure Build Settings (1 menit)

Vercel akan auto-detect Next.js. **Jangan ubah apa-apa**, biarkan default:

```
Framework Preset: Next.js ✅
Root Directory: ./ ✅
Build Command: pnpm build ✅
Output Directory: .next ✅
Install Command: pnpm install ✅
Node.js Version: 20.x ✅
```

### STEP 3: Environment Variables (PENTING!)

**Klik "Environment Variables"** dan tambahkan **6 variables** ini:

#### 1. AUTH_SECRET (WAJIB!)
```
Name: AUTH_SECRET
Value: [Generate baru di terminal dengan: openssl rand -base64 32]
```

**Generate AUTH_SECRET:**
- Buka terminal
- Jalankan: `openssl rand -base64 32`
- Copy hasilnya (misal: `muCsy07l+WLJyLZSQSuQOHquWNh+006OQvS8dDXhfB8=`)
- Paste ke Vercel

#### 2. DATABASE_URL (Dari Supabase)
```
Name: DATABASE_URL
Value: postgresql://postgres.isixvsxfnwuvwiwiqxlg:wdIUS5zfpCJLCfTr@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10
```

#### 3. DIRECT_URL (Dari Supabase)
```
Name: DIRECT_URL
Value: postgresql://postgres.isixvsxfnwuvwiwiqxlg:wdIUS5zfpCJLCfTr@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
```

#### 4. AUTH_GOOGLE_ID (Sementara placeholder dulu)
```
Name: AUTH_GOOGLE_ID
Value: placeholder-google-id
```

#### 5. AUTH_GOOGLE_SECRET (Sementara placeholder dulu)
```
Name: AUTH_GOOGLE_SECRET
Value: placeholder-google-secret
```

#### 6. NEXT_PUBLIC_APP_URL (Update setelah dapat URL Vercel)
```
Name: NEXT_PUBLIC_APP_URL
Value: https://your-app.vercel.app
```

**Tips:** Untuk sekarang, pakai URL dummy dulu: `https://family-finance.vercel.app`  
Nanti kita update setelah dapat URL actual.

### STEP 4: Deploy! (2-3 menit)

1. **Klik "Deploy"**
2. **Tunggu ~2-3 menit** (Vercel akan build project)
3. **Jika berhasil:** Akan muncul confetti dan "Congratulations!" 🎉

### STEP 5: Copy URL Production

Setelah deploy berhasil:

1. **Copy URL production** (misal: `https://family-finance-xxx.vercel.app`)
2. **Update environment variable:**
   - Vercel Dashboard → Settings → Environment Variables
   - Edit `NEXT_PUBLIC_APP_URL`
   - Ganti dengan URL production yang actual
3. **Redeploy:**
   - Deployments tab → Klik "..." pada deployment terakhir → "Redeploy"

---

## ✅ TEST APLIKASI

### 1. Health Check

Buka: `https://your-app.vercel.app/api/health`

**Should return:**
```json
{
  "status": "ok",
  "timestamp": "2026-...",
  "database": "connected"
}
```

✅ = Database connected!

### 2. Test Register & Login

1. Buka: `https://your-app.vercel.app`
2. Klik "Register" / "Daftar"
3. Buat akun baru dengan:
   - Nama lengkap
   - Email
   - Password
4. Klik "Daftar"
5. Login dengan akun baru

**Jika berhasil:** Masuk ke dashboard! ✅

### 3. Test Create Transaction

1. Sidebar → **Transaksi** → **+ Tambah**
2. Isi form:
   - Jenis: Pemasukan
   - Kategori: Gaji
   - Jumlah: 5000000
   - Tanggal: Hari ini
3. Klik "Simpan"

**Should:** Transaction muncul di list ✅

### 4. Test Create Budget

1. Sidebar → **Anggaran** → **+ Tambah**
2. Isi form:
   - Kategori: Makanan & Minuman
   - Limit: 3000000
   - Periode: Bulan ini
3. Klik "Simpan"

**Should:** Budget muncul dengan progress bar ✅

---

## 🔧 SETUP GOOGLE OAUTH (Optional - 15 menit)

**Jika mau enable login dengan Google:**

### A. Google Cloud Console

1. **Buka:** https://console.cloud.google.com
2. **Pilih/Buat project:** "Family Finance"
3. **Enable Google+ API:**
   - APIs & Services → Library
   - Search "Google+ API" → Enable
4. **OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - User Type: External → Create
   - App name: Family Finance
   - User support email: [email Anda]
   - Developer contact: [email Anda]
   - Save and Continue
5. **Create Credentials:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Family Finance Production
   
   **Authorized JavaScript origins:**
   ```
   https://your-actual-vercel-url.vercel.app
   ```
   
   **Authorized redirect URIs:**
   ```
   https://your-actual-vercel-url.vercel.app/api/auth/callback/google
   ```
   
   **PENTING:** Ganti `your-actual-vercel-url` dengan URL Vercel yang actual!

6. **Copy credentials:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client secret: `GOCSPX-xxxxx`

### B. Update Vercel Environment Variables

1. Vercel → Settings → Environment Variables
2. Edit:
   - `AUTH_GOOGLE_ID` = Client ID dari step A
   - `AUTH_GOOGLE_SECRET` = Client secret dari step A
3. Save

### C. Redeploy

1. Deployments tab → "..." → "Redeploy"
2. Wait ~2 minutes
3. **Test:** Login dengan Google should work! ✅

---

## 📊 MONITORING

### Vercel Dashboard

**Check:**
- **Analytics:** Page views, performance
- **Functions:** Server logs, errors
- **Deployments:** Build history

### Database (Supabase)

**Your current database:**
- Host: `aws-1-ap-northeast-2.pooler.supabase.com`
- Region: South Korea (ap-northeast-2)

**Monitor:**
1. Buka: https://supabase.com/dashboard
2. Pilih project Anda
3. Check:
   - Database size
   - Active connections
   - Query performance

---

## 💰 BIAYA

**Current Setup (FREE!):**
- ✅ Vercel Hobby: **$0/bulan**
- ✅ Supabase Free: **$0/bulan**
  - 500MB database
  - 2GB bandwidth
  - 50,000 Monthly Active Users
- **Total: FREE!** 🎉

**Upgrade nanti jika perlu:**
- Vercel Pro: $20/bulan
- Supabase Pro: $25/bulan

---

## 🎉 SELAMAT!

Setelah semua step selesai, aplikasi Family Finance Anda akan **LIVE** di internet!

**Share ke keluarga:**
```
https://your-app.vercel.app

Login: [Pakai 1 akun untuk semua anggota keluarga]
```

---

## 📝 CHECKLIST

- [ ] 1. Login ke Vercel dengan GitHub
- [ ] 2. Import repository "Family-finance"
- [ ] 3. Add 6 environment variables
- [ ] 4. Deploy pertama kali
- [ ] 5. Copy URL production
- [ ] 6. Update `NEXT_PUBLIC_APP_URL`
- [ ] 7. Redeploy
- [ ] 8. Test `/api/health` endpoint
- [ ] 9. Test register & login
- [ ] 10. Test create transaction
- [ ] 11. Test create budget
- [ ] 12. (Optional) Setup Google OAuth
- [ ] 13. Share URL ke keluarga! 🎊

---

## 🔗 LINKS

- **GitHub Repo:** https://github.com/AdillaRuby/Family-finance.git
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Google Cloud Console:** https://console.cloud.google.com
- **Supabase Dashboard:** https://supabase.com/dashboard

---

**Happy deploying!** 🚀

**Selamat deploy!** 🚀💰

