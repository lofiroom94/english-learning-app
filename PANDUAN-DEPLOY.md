# Panduan Deploy — Vercel + Supabase (Gratis, ±10 Menit)

## Langkah 1 — Database di Supabase
1. Buka supabase.com → **New Project** (daftar pakai email, gratis).
2. Beri nama proyek, buat kata sandi database (simpan baik-baik), pilih region terdekat (Singapore).
3. Setelah proyek jadi: menu **SQL Editor** → **New query** → salin seluruh isi
   `supabase/schema.sql` dari paket ini → **Run**. Selesai bila muncul "Success".
4. Menu **Settings → API**: catat **Project URL** dan **anon / public key**.

## Langkah 2 — Sambungkan website ke database
1. Buka `public/app.js`, ganti:
   - `SUPABASE_URL` → Project URL dari langkah 1
   - `SUPABASE_ANON_KEY` → anon key dari langkah 1
2. Simpan. (Anon key memang dirancang tampil di frontend; data dilindungi
   Row Level Security — tiap pengguna hanya bisa melihat datanya sendiri.)

## Langkah 3 — Deploy ke Vercel
Pilihan A (paling mudah, tanpa Git):
1. Buka vercel.com → daftar (gratis) → **Add New → Project**.
2. Bila diminta repo, unggah folder paket ini ke GitHub dulu, lalu import repo itu.
   Atau pakai Vercel CLI: `npm i -g vercel` lalu `vercel` di folder paket ini.
3. Framework Preset: **Other**. Root directory: folder paket ini (`vercel.json`
   sudah mengatur folder `public/` sebagai output). Klik **Deploy**.
4. Vercel memberi link publik, contoh: `nama-proyek.vercel.app` — itu link websitemu.

Pilihan B (Netlify): drag & drop folder paket ini ke netlify.com/drop —
`vercel.json` tidak dipakai, tapi folder `public/` tetap yang diterbitkan
(atur Publish directory = `public`).

## Langkah 4 — Tes
1. Buka link Vercel → **Daftar akun baru** dengan emailmu.
2. Selesaikan 1 pelajaran → XP bertambah.
3. Tutup browser, buka lagi, masuk dengan akun yang sama → **XP & progres tetap ada**.
   Itulah bedanya versi ini dibanding versi statis: progres tersimpan di database.

## Tambah bahasa lain nanti (Korea, Jepang, dll.)
Tidak perlu hosting/database baru:
1. Tambahkan data pelajaran baru di `public/data.js` dengan `language_code` baru (`ko`, `ja`).
2. Ubah/tambah pemilih bahasa di `public/app.js` (konstanta `LANGUAGE_CODE`).
3. Progres tiap bahasa otomatis terpisah karena tabel menyimpan `language_code`.

## Biaya
Paket gratis Supabase + Vercel cukup untuk pemakaian pribadi & pengguna kecil.
Domain sendiri (opsional) ± Rp150–200 ribu/tahun. Selebihnya gratis sampai trafik besar.
