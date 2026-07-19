# Pull Request: Integrasi & Verifikasi Payment Gateway (Mock & Midtrans Sandbox)

## 📝 Deskripsi Perubahan
PR ini mencakup penggabungan alur pembayaran (payment gateway) untuk registrasi kompetisi ITB Insight 2026, yang mendukung simulasi pembayaran internal (Mock Payment) serta integrasi gerbang pembayaran eksternal (Midtrans Sandbox).

### Perubahan Utama:
1. **Perbaikan Fallback Dinamis Frontend**: Memodifikasi [payment-action-button.tsx](file:///c:/Users/hakam/HAKAM%20ITB/itb-insight/web/components/dashboard/payment-action-button.tsx) agar secara dinamis meminta provider `'midtrans'` secara default jika riwayat kosong. Apabila Midtrans dinonaktifkan di backend (`PAYMENT_ENABLE_MIDTRANS=false`), server Next.js secara otomatis melakukan fallback aman ke `'mock'`.
2. **Jembatan Webhook Alias (Fix 404)**: Menambahkan route handler baru di [app/api/webhooks/payment/route.ts](file:///c:/Users/hakam/HAKAM%20ITB/itb-insight/web/app/api/webhooks/payment/route.ts) untuk mengantisipasi notifikasi webhook dari dashboard merchant Midtrans lama yang mengarah ke `/api/webhooks/payment`, meneruskannya secara aman ke handler asli `/api/payments/midtrans/notification`.
3. **Bypass Login untuk Testing (Dev-only)**: Menambahkan route helper [app/auth/test-login/route.ts](file:///c:/Users/hakam/HAKAM%20ITB/itb-insight/web/app/auth/test-login/route.ts) guna mempermudah login otomatis akun tester tanpa terkena pembatasan limit email OTP (Magic Link) dari Supabase. Route ini diproteksi agar **non-aktif** secara otomatis di environment Production.

---

## 🛠️ Status Implementasi Task

- [x] **Jalanin Mock Payment**
- [x] **Jalanin Midtrans Sandbox**
- [x] **Cek Webhook**
- [x] **Cek Status Payment: pending, paid, failed, expired, cancelled**
- [x] **Cek Env yang Dibutuhkan**
- [x] **Catat Apa Saja yang Masih Perlu Sebelum Production**

---

## 📸 Bukti Hasil Pengujian (Screenshots & Deskripsi)

### 1. Jalanin Mock Payment
* **Deskripsi**: Ketika parameter `PAYMENT_ENABLE_MIDTRANS` di-set `false`, pengguna diarahkan ke halaman simulasi internal di aplikasi setelah menekan tombol "Bayar".
* **Langkah**: Klik "Bayar" di dashboard $\rightarrow$ diarahkan ke halaman `/dashboard/payments/[id]/mock`.
* **Bukti Visual**:
  * **Dashboard Awal (Registrasi Dikirim, Status Belum Bayar)**:
    ![Dashboard Awal](/test-evidence/dashboard_unpaid.png)
  * **Halaman Simulasi Pembayaran Mock**:
    ![Mock Checkout](/test-evidence/mock_checkout.png)

---

### 2. Jalanin Midtrans Sandbox
* **Deskripsi**: Ketika parameter `PAYMENT_ENABLE_MIDTRANS` di-set `true`, penekanan tombol "Bayar" langsung menghubungi API Snap Midtrans dan mengalihkan pengguna ke gateway pembayaran Sandbox Midtrans resmi.
* **Langkah**: Klik "Bayar" $\rightarrow$ dialihkan secara eksternal ke `app.sandbox.midtrans.com`.
* **Bukti Visual**:
  * **Portal Pembayaran Sandbox Midtrans**:
    ![Midtrans Sandbox Checkout](/test-evidence/midtrans_sandbox_checkout.png)

---

### 3. Cek Webhook & Transisi Status Payment
* **Deskripsi**: Memverifikasi bahwa notifikasi instan dari Midtrans berhasil diterima oleh server Next.js lokal (melalui terowongan `ngrok` pada route `/api/webhooks/payment` atau `/api/payments/midtrans/notification`), ditandai dengan validasi signature SHA512 dan perubahan status otomatis di database Supabase menjadi `paid`.
* **Langkah**: Selesaikan pembayaran di Midtrans Simulator $\rightarrow$ webhook terkirim $\rightarrow$ status dashboard otomatis berubah.
* **Bukti Visual**:
  * **Dashboard Terupdate Sukses (Status Paid / Menunggu Verifikasi Admin)**:
    ![Dashboard Paid](/test-evidence/dashboard_paid.png)

---

## ⚙️ Cek Environment Variable yang Dibutuhkan (`.env.local`)

Pastikan variabel-variabel berikut telah terkonfigurasi dengan benar sebelum memulai pengujian lokal:

```bash
# URL Aplikasi lokal / ngrok tunnel aktif
NEXT_PUBLIC_SITE_URL=https://jalapeno-shallot-dandruff.ngrok-free.dev

# Supabase Staging Connection (Project: zwjqsephvjdisssrpfuv)
NEXT_PUBLIC_SUPABASE_URL=https://zwjqsephvjdisssrpfuv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Midtrans Integration (Sandbox Mode)
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...
MIDTRANS_IS_PRODUCTION=false
PAYMENT_ENABLE_MIDTRANS=true
```

---

## 📋 Checklist Sebelum Production Go-Live

Sebelum meluncurkan fitur pembayaran ini ke lingkungan Production, pastikan langkah-langkah berikut telah terpenuhi secara lengkap:

1. [ ] **Verifikasi Akun Midtrans Production**: Mengajukan dan mendapatkan persetujuan untuk akun Midtrans Production yang aktif.
2. [ ] **Konfigurasi Secret Production**: Mengonfigurasi variabel `MIDTRANS_SERVER_KEY` menggunakan Server Key Production di dashboard hosting (misal: Vercel Secrets).
3. [ ] **Ubah Mode Produksi**: Mengubah variabel `MIDTRANS_IS_PRODUCTION` menjadi `true` dan memastikan `PAYMENT_ENABLE_MIDTRANS` bernilai `true` pada scope Production.
4. [ ] **Pendaftaran URL Webhook Resmi**: Mendaftarkan URL webhook produksi Anda secara resmi di Dashboard Midtrans Production:
   `https://<domain-produksi-anda>/api/payments/midtrans/notification` (atau `/api/webhooks/payment`).
5. [ ] **Pemisahan Database Supabase**: Memastikan database Production menggunakan project reference Supabase yang berbeda dan bersih (tidak tercampur dengan data testing/registrasi dummy).
6. [ ] **Uji Coba Transaksi Nominal Terkecil**: Melakukan satu uji coba pembayaran riil dengan nominal minimum (misal Rp 10.000) menggunakan akun pembayaran asli di Production untuk memvalidasi integrasi akhir.
