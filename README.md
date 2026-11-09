# English Learning App — Paket Hosting + Database

Website latihan Bahasa Inggris lengkap (gaya Duolingo/Volingo) yang bisa
di-hosting sendiri: **bisa dibuka lewat link browser DAN progres + XP
tersimpan di database per akun** (tidak reset saat halaman ditutup).

## Isi paket

```
public/index.html   Halaman utama (single-page app)
public/styles.css   Tampilan
public/data.js      Data 42 pelajaran A0–C2 (edit di sini untuk tambah konten/bahasa)
public/app.js       Logika aplikasi + koneksi Supabase
supabase/schema.sql Skema database lengkap (jalankan sekali di Supabase)
vercel.json         Konfigurasi deploy Vercel
.env.example        Contoh variabel lingkungan (jangan isi kunci asli di file yang dibagikan)
PANDUAN-DEPLOY.md   Langkah deploy Vercel + Supabase (±10 menit, paket gratis)
```

## Fitur

- 42 pelajaran, 7 level A0–C2: kosakata, tata bahasa, bacaan, dialog (dengan audio browser / Web Speech API)
- Arti Bahasa Indonesia di setiap soal, kosakata, bacaan, dan dialog
- Kotak **"Konteks — baca dulu sebelum menjawab"** di soal isian, agar jawaban tidak ambigu
  (contoh: "She is my ___" diberi konteks artinya "teman", bukan "sister")
- 13 **Catatan Penting** di Beranda: am/is/are, do/does, did, have/has, was/were,
  will/would, can/could/should/must, akhiran -s/-es, a/an/the, kata ganti orang,
  kata ganti milik, this/that/these/those, dan **kenapa "a university" bukan "an university"**
- Bagian **Jenis Kata** di Beranda: noun, verb, adjective, adverb, pronoun,
  preposition, conjunction, interjection — dengan **Kata Hari Ini yang berganti setiap hari**
- Login (email + kata sandi via Supabase Auth), XP, streak, progres per pelajaran tersimpan di database
- Siap multi-bahasa: setiap baris konten & progres punya `language_code`
  (`en` = Inggris; tambah `ko`, `ja`, dll. tanpa ganti hosting/database)

## Cara pakai singkat

1. Buat proyek gratis di supabase.com → jalankan `supabase/schema.sql` di SQL Editor.
2. Salin URL + anon key proyek ke `public/app.js` (bagian `SUPABASE_URL` / `SUPABASE_ANON_KEY`)
   atau set sebagai environment variable sesuai `PANDUAN-DEPLOY.md`.
3. Deploy folder ini ke Vercel (drag & drop / import GitHub) → dapat link publik.
4. Buka link, daftar akun, mulai belajar. Progres tersimpan otomatis.

Detail lengkap ada di **PANDUAN-DEPLOY.md**.
