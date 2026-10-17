# 🎓 Sistem Informasi Bimbingan Konseling (SI-BK) SMAN 26 Kabupaten Tangerang

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MariaDB/MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20MariaDB-003545?style=for-the-badge&logo=mariadb)](https://mariadb.org/)
[![Upstash Redis](https://img.shields.io/badge/Rate%20Limit-Upstash%20Redis-00E599?style=for-the-badge&logo=redis)](https://upstash.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security Audited](https://img.shields.io/badge/Security-Hardened%20Grade%20A-green?style=for-the-badge&logo=shield)](https://owasp.org/)

---

## 📌 1. Ringkasan Proyek (Overview)

**Sistem Informasi Bimbingan Konseling (SI-BK) SMAN 26 Kabupaten Tangerang** adalah platform layanan bimbingan konseling digital terpadu berbasis web yang dikembangkan untuk mendigitalisasi operasional Guru BK serta memberikan layanan bimbingan yang transparan, aman, dan terukur bagi siswa. 

Sistem ini mentransformasi seluruh alur kerja manual sekolah menjadi terkomputerisasi, mencakup:
1. **Manajemen Kedisiplinan Siswa**: Pencatatan pelanggaran tata tertib berbasis poin dengan mesin evaluasi otomatis (*Decision Support System* / DSS) berjenjang (Pasal 8).
2. **Asesmen Psikologis & Diagnostik Mandiri**: Instrumen Gaya Belajar (VAK - 30 butir), Angket Kebutuhan Masalah / DCM (Angket Masalah - 99 butir), serta Tes Minat & Bakat (RIASEC - 42 butir).
3. **Pemetaan Penjurusan Ilmiah**: Rekomendasi peminatan otomatis bagi siswa Kelas 10 menuju Kelas 11 (MIPA, IPS, atau Bahasa & Budaya) berdasarkan bobot peringkat 3 huruf Holland (`top1`, `top2`, `top3`) dengan aturan spesifik (`RIA = MIPA`, `C = Bahasa`, `SEC = IPS`).
4. **Portal Konseling Interaktif**: Pengajuan jadwal konseling tatap muka secara privat dengan aturan ketat *single active session* (mencegah spam/double booking).
5. **Perlindungan Data & Keamanan Infrastruktur**: Keamanan sesi berbasis SHA-256 tanpa *double-hashing*, enkripsi password Argon2id, mitigasi *timing attack*, proteksi IDOR/BOLA, serta rate limiting terdistribusi di Edge via `src/proxy.ts`.

---

## 🎯 2. Latar Belakang & Tujuan Sistem

### Latar Belakang
Sebelum implementasi sistem ini, layanan BK di SMAN 26 Kabupaten Tangerang menghadapi sejumlah tantangan operasional:
- **Pencatatan Manual Rentan Hilang & Lambat**: Akumulasi poin pelanggaran dicatat di buku fisik atau lembaran kertas yang terfragmentasi, menyulitkan monitoring riwayat siswa lintas tingkatan kelas.
- **Asesmen Penjurusan Masih Konvensional**: Pengolahan tes minat bakat untuk penjurusan kelas 11 membutuhkan waktu koreksi manual yang lama dan rentan terhadap bias subjektif.
- **Hambatan Akses Konseling**: Siswa kerap merasa enggan atau malu mendatangi ruang BK secara langsung untuk mengajukan konseling pribadi tanpa jadwal yang terstruktur.

### Tujuan Utama
- **Monitoring Real-Time & Transparan**: Memberikan kemudahan bagi Guru BK memantau dinamika kedisiplinan dan rekapitulasi poin pelanggaran siswa secara *live*.
- **Rekomendasi Berbasis Data Ilmiah**: Menerapkan algoritma DSS untuk mengalkulasi rekomendasi jurusan dan modalitas belajar siswa secara objektif sesuai pedoman sekolah.
- **Aksesibilitas & Kerahasiaan Konseling**: Memberikan ruang yang nyaman dan privat bagi siswa untuk mengajukan sesi bimbingan konseling secara terstruktur dari gawai masing-masing.

---

## 🚀 3. Fitur Utama & Modul Sistem

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        SI-BK SMAN 26 KABUPATEN TANGERANG               │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│    Autentikasi   │   Kedisiplinan   │     Asesmen      │   Konseling   │
│    & Role Guard  │    & DSS Poin    │   & Penjurusan   │   Interaktif  │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • Unified Login  │ • Transaksi Poin │ • Gaya Belajar   │ • Pengajuan   │
│ • Argon2id Hash  │ • DSS Pasal 8    │   VAK (30 Butir) │   Jadwal Temu │
│ • Cookie SHA-256 │ • Ambang Sanksi: │ • Minat Bakat    │ • Single      │
│ • Anti-Timing    │   25, 50, 75, 100│   RIASEC (42 Btr)│   Active      │
│   Attack Masking │ • Remisi Poin    │ • Angket Masalah │   Session     │
│ • RBAC Terisolasi│   (Prestasi/Tertib│  DCM (99 Butir)  │ • Catatan BK  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 3.1. Modul Autentikasi & RBAC (Role-Based Access Control)
- **Form Login Tunggal (Unified Login)**: Siswa login menggunakan **NISN**, sedangkan Guru BK login menggunakan **NIP** tanpa memerlukan *role selector*.
- **Kriptografi Argon2id**: Penyimpanan kata sandi menggunakan hashing modern Argon2id.
- **Mitigasi Timing Attack / Account Enumeration**: Menggunakan verifikasi *constant-time* berbasis dummy hash (`DUMMY_ARGON2_HASH`) untuk menyamarkan waktu respons saat username tidak terdaftar.
- **Sesi Kriptografis Mandiri**: Token sesi di-hash dengan SHA-256 sebelum disimpan ke tabel database dan ditanamkan ke browser via cookie berflag `httpOnly: true`, `sameSite: "lax"`, dan `secure: true`. Fitur ubah password menggunakan `deleteOtherSessionsByHash` agar sesi aktif saat ini tidak ikut terhapus (*no double-hashing bug*).
- **Isolasi Namespace Ketat**: Seluruh endpoint administratif Guru BK (`/api/bk/*`) terisolasi penuh (`requireAuth(req, ["BK"])`) dan menolak akses dari akun role `SISWA`.

### 3.2. Modul Kedisiplinan & DSS Poin Tata Tertib (Pasal 8)
- **Mutasi Poin Atomik**: Pencatatan pelanggaran dan penambahan `totalPoin` kumulatif siswa dibungkus dalam transaksi atomik database (`prisma.$transaction`) guna mencegah *race condition*.
- **Mesin Evaluasi Sanksi Otomatis (DSS Kumulatif Pasca-Upgrade)**:
  Sistem mengevaluasi status kedisiplinan siswa berdasarkan buku panduan tata tertib sekolah:
  * **$< 25$ Poin**: Status `Disiplin / Aman`.
  * **25 – 49 Poin**: Status `Peringatan 1` (Pembinaan awal oleh Wali Kelas).
  * **50 – 74 Poin**: Status `Peringatan 2` (Pemanggilan Orang Tua I & pembinaan Guru BK).
  * **75 – 99 Poin**: Status `Peringatan Terakhir` (Pemanggilan Orang Tua II, Wakasek, & surat pernyataan bermaterai).
  * **$\ge$ 100 Poin**: Status `Sanksi Maksimal / Drop Out` (Pertemuan Kepala Sekolah & pengembalian siswa ke orang tua).
- **Fitur Remisi / Pengurangan Poin**: Mengakomodasi kriteria pengurangan poin berdasarkan catatan kedisiplinan 1 bulan penuh (10%), kebersihan sekolah (-5 poin), hingga prestasi kejuaraan tingkat Kabupaten hingga Internasional (-10 s.d. -25 poin).

### 3.3. Modul Asesmen & Pemetaan Penjurusan (DSS Kelas 11)
- **Angket Masalah Siswa (DCM / 99 Butir)**:
  * Instrumen cek masalah kualitatif mencakup bidang Pribadi, Sosial, Belajar, dan Karier.
  * Dilindungi validator Zod dengan mekanisme anti-duplikasi elemen array (`new Set(items).size === items.length`).
- **Gaya Belajar (VAK / 30 Butir)**:
  * Mengukur modalitas belajar: Visual ($V$), Auditori ($A$), dan Kinestetik ($K$).
- **Minat & Bakat (RIASEC / 42 Butir)**:
  * Khusus siswa Kelas 10 (`isGrade10` guard) untuk persiapan penjurusan Kelas 11.
  * Mengukur 6 dimensi John Holland. Rekomendasi jurusan divalidasi menggunakan akumulasi bobot peringkat (`top1` = 3, `top2` = 2, `top3` = 1) dengan aturan mutlak:
    * `top1 === 'C'` $\rightarrow$ **Bahasa & Budaya**
    * Klaster RIA Dominan $\rightarrow$ **MIPA**
    * Klaster SEC Dominan $\rightarrow$ **IPS**
- **Single-Submission Locking**: Siswa hanya dapat mengerjakan masing-masing asesmen sebanyak 1 kali (`findLatestBySiswaId` check) untuk menjaga orisinalitas data.

### 3.4. Modul Konseling Interaktif
- **Single Active Session**: Siswa yang masih memiliki tiket konseling berstatus `PENDING` atau `DISETUJUI` dilarang membuat janji temu baru untuk mencegah *spamming/double booking*.
- **Alur Status Konseling**: `PENDING` $\rightarrow$ `DISETUJUI` / `DITOLAK` $\rightarrow$ `SELESAI`.

### 3.5. Keamanan Infrastruktur & Edge Protection (`src/proxy.ts`)
- **Distributed Rate Limiting (Upstash Redis)**:
  * `/api/auth/*`: Dibatasi **5 request / 1 menit** (Sliding Window) guna memitigasi *brute-force*.
  * `/api/siswa/assessment/*` & `/api/siswa/konseling`: Dibatasi **15 request / 1 menit** guna mencegah manipulasi submission.
  * Dilengkapi mekanisme *fail-open* (jika Redis mengalami kendala, aplikasi tetap dapat diakses).
- **HTTP Security Headers (OWASP Compliant)**:
  * `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, dan `poweredByHeader: false`.

---

## 🏗️ 4. Arsitektur & Tech Stack

| Layer | Teknologi / Library | Keterangan & Peran |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | Full-stack framework dengan arsitektur serverless/edge. |
| **Language** | TypeScript 5 | Static typing ketat dari layer UI hingga repository. |
| **Database ORM** | Prisma ORM (`@prisma/client`) | Data modeling, relasi cascade, dan generator query typesafe. |
| **Driver Adapter**| `@prisma/adapter-mariadb` | Koneksi native MariaDB/MySQL dengan pembatas `connectionLimit: 1` per worker serverless. |
| **Database Engine**| MySQL / MariaDB | Relational database dengan tabel yang dilengkapi indeks strategis (`@@index`). |
| **Rate Limiter** | `@upstash/ratelimit` & `@upstash/redis` | Distributed sliding-window rate limiting via file `src/proxy.ts`. |
| **Kriptografi** | `argon2` & `node:crypto` | Hashing password standar industri & token random generator. |
| **Validasi Input**| `zod` | Skema validasi runtime untuk seluruh request body & query. |

---

## 📂 5. Struktur Direktori Proyek

```text
bk-26/
├── prisma/
│   ├── schema.prisma          # Skema basis data & indeks optimasi
│   ├── seed.ts                # Seeder akun role & guru BK
│   └── sync-users.ts          # Sinkronisasi data siswa
├── src/
│   ├── app/
│   │   └── api/               # REST API Handlers Next.js App Router
│   │       ├── auth/          # Login, logout, me, change-password
│   │       ├── bk/            # Endpoint administratif Guru BK (rekap, pelanggaran, konseling)
│   │       ├── profile/       # Profil siswa login
│   │       └── siswa/         # Asesmen VAK, RIASEC, Angket Masalah, & konseling
│   ├── constants/             # Bank soal VAK, RIASEC, DCM, pelanggaran, & sanksi
│   ├── generated/             # Client Prisma ter-generate
│   ├── lib/
│   │   ├── auth/              # requireAuth & helper verifikasi role
│   │   ├── prisma.ts          # Singleton Prisma client & serverless pooling
│   │   └── utils/             # Cookie, response formatter, crypto
│   ├── repositories/          # Layer akses data murni Prisma
│   ├── schemas/               # Skema validasi Zod
│   ├── services/              # Business logic & DSS calculation engine
│   └── proxy.ts               # Logika Edge Rate Limiting Upstash Redis
├── next.config.ts             # Konfigurasi security headers & engine Next.js
└── package.json               # Manifes dependensi & script proyek
```

---

## 🛠️ 6. Panduan Instalasi & Menjalankan Proyek (Getting Started)

### Prasyarat Sistem
* **Node.js**: Versi `18.18.0` atau lebih baru.
* **MySQL / MariaDB**: Server database aktif di lokal atau cloud.
* **Upstash Redis**: Akun Upstash gratis untuk kredensial REST URL & Token.

### Langkah 1: Kloning & Instalasi Dependensi
```bash
git clone https://github.com/ressaeka/bk-sman26.git
cd bk-sman26
npm install
```

### Langkah 2: Konfigurasi Environment Variables (`.env`)
Buat file `.env` di direktori root:

```env
NODE_ENV="development"

# Konfigurasi Database MySQL / MariaDB
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="bk_26_db"

# URL Koneksi Prisma (Gunakan connection_limit=1 untuk serverless)
DATABASE_URL="mysql://root:your_password@localhost:3306/bk_26_db?connection_limit=1"

# Kredensial Upstash Redis (Rate Limiter di src/proxy.ts)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_rest_token"
```

### Langkah 3: Migrasi & Sinkronisasi Basis Data
```bash
npx prisma generate
npx prisma db push
```

### Langkah 4: Menjalankan Server Lokal
```bash
npm run dev
```

Aplikasi aktif di `http://localhost:3000`.

---

## 🔐 7. Kredensial Awal Akun Default

Berdasarkan *seeder* bawaan sistem, akun awal dibuat menggunakan format standar berikut:

| Peran Akun | Username | Format Kata Sandi Awal | Catatan |
| :--- | :--- | :--- | :--- |
| **Guru BK** | NIP Guru BK (Contoh: `198501...`) | `${NIP}#sman26` | Wajib mengganti password di dashboard. |
| **Siswa** | NISN Siswa (Contoh: `007123...`) | `${NISN}#sman26` | Siswa Kelas 10 berhak mengerjakan RIASEC. |

---

## 📄 8. Lisensi & Hak Cipta

Proyek ini dikembangkan khusus untuk **SMAN 26 Kabupaten Tangerang** dalam rangka digitalisasi dan pengamanan layanan bimbingan konseling sekolah. Seluruh hak cipta dilindungi undang-undang.
