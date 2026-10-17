# 🎓 Sistem Informasi Bimbingan Konseling (SI-BK) SMAN 26 Kabupaten Tangerang

[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![MariaDB/MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20MariaDB-003545?style=for-the-badge&logo=mariadb)](https://mariadb.org/)
[![Upstash Redis](https://img.shields.io/badge/Rate%20Limit-Upstash%20Redis-00E599?style=for-the-badge&logo=redis)](https://upstash.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security Audited](https://img.shields.io/badge/Security-Hardened%20%26%20Audited-green?style=for-the-badge&logo=shield)](https://owasp.org/)

---

## 📌 1. Ringkasan Proyek (Overview)

**Sistem Informasi Bimbingan Konseling (SI-BK) SMAN 26 Kabupaten Tangerang** adalah platform layanan bimbingan konseling digital terpadu berbasis web yang dikembangkan untuk mendigitalisasi operasional Guru BK serta memberikan layanan bimbingan yang transparan, aman, dan terukur bagi siswa. 

Sistem ini mentransformasi seluruh alur kerja manual sekolah menjadi terkomputerisasi, mencakup:
1. **Manajemen Kedisiplinan Siswa**: Pencatatan pelanggaran tata tertib berbasis poin dengan mesin evaluasi otomatis (*Decision Support System* / DSS).
2. **Asesmen Psikologis & Diagnostik Mandiri**: Instrumen Gaya Belajar (VAK), Angket Kebutuhan Masalah (DCM/AKPD), serta Tes Minat & Bakat (RIASEC).
3. **Pemetaan Penjurusan Ilmiah**: Rekomendasi peminatan otomatis bagi siswa Kelas 10 menuju Kelas 11 (MIPA, IPS, atau Bahasa & Budaya).
4. **Portal Konseling Interaktif**: Pengajuan jadwal konseling tatap muka secara privat dengan aturan pencegahan *double-booking*.
5. **Perlindungan Data & Keamanan Infrastruktur**: Keamanan berbasis sesi kriptografis terisolasi, enkripsi password Argon2id, mitigasi *timing attack*, dan rate limiting terdistribusi di Edge.

---

## 🎯 2. Latar Belakang & Tujuan Sistem

### Latar Belakang
Sebelum implementasi sistem ini, layanan BK di SMAN 26 Kabupaten Tangerang menghadapi sejumlah tantangan operasional:
* **Pencatatan Manual Rentan Hilang & Lambat**: Akumulasi poin pelanggaran dicatat di buku fisik atau lembaran kertas yang terfragmentasi, menyulitkan monitoring riwayat siswa lintas tingkatan kelas (X s/d XII).
* **Asesmen Penjurusan Masih Konvensional**: Pengolahan tes minat bakat untuk penjurusan kelas 11 membutuhkan waktu koreksi manual yang lama dan rentan terhadap bias subjektif.
* **Hambatan Akses Konseling**: Siswa kerap merasa enggan atau malu mendatangi ruang BK secara langsung untuk mengajukan konseling pribadi tanpa jadwal yang terstruktur.

### Tujuan Utama
* **Monitoring Real-Time & Transparan**: Memberikan kemudahan bagi Guru BK memantau dinamika kedisiplinan dan rekapitulasi poin pelanggaran siswa secara *live*.
* **Rekomendasi Berbasis Data Ilmiah**: Menerapkan algoritma DSS untuk mengalkulasi rekomendasi jurusan dan modalitas belajar siswa secara objektif.
* **Aksesibilitas & Kerahasiaan Konseling**: Memberikan ruang yang nyaman dan privat bagi siswa untuk mengajukan sesi bimbingan konseling secara terstruktur dari gawai masing-masing.

---

## 🚀 3. Fitur Utama & Modul Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│               SI-BK SMAN 26 KABUPATEN TANGERANG                        │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│   Autentikasi    │   Kedisiplinan   │     Asesmen      │   Konseling   │
│   & Role Guard   │    & DSS Poin    │   & Penjurusan   │  Interaktif   │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ • Unified Login  │ • Transaksi Poin │ • Gaya Belajar   │ • Pengajuan   │
│ • Argon2id Hash  │ • DSS Pasal 8    │   VAK (30 Butir) │   Jadwal Temu │
│ • Cookie SHA-256 │ • Ambang Sanksi: │ • Minat Bakat    │ • Single      │
│ • Anti-Timing    │   SP1, SP2/Ortu, │   RIASEC (42 Btr)│   Active      │
│   Attack Masking │   Drop Out (100) │ • Angket Masalah │   Session     │
│ • RBAC Terisolasi│ • Log Riwayat    │   DCM (99 Butir) │ • Catatan BK  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 3.1. Modul Autentikasi & RBAC (Role-Based Access Control)
* **Form Login Tunggal (Unified Login)**: Siswa login menggunakan **NISN**, sedangkan Guru BK login menggunakan **NIP** tanpa memerlukan *role selector*.
* **Kriptografi Argon2id**: Penyimpanan kata sandi menggunakan hashing modern Argon2id yang tahan terhadap serangan GPU-based cracking.
* **Mitigasi Timing Attack / Account Enumeration**: Menggunakan verifikasi *constant-time* berbasis dummy hash untuk menyamarkan waktu respons saat username tidak terdaftar.
* **Sesi Kriptografis Mandiri**: Token sesi acak 256-bit di-hash dengan SHA-256 sebelum disimpan ke tabel database dan ditanamkan ke browser via cookie berflag `httpOnly: true`, `sameSite: "lax"`, dan `secure: true`.
* **Isolasi Namespace Ketat**: Seluruh endpoint administratif Guru BK (`/api/bk/*`) terisolasi penuh dan menolak akses dari akun role `SISWA`.

### 3.2. Modul Kedisiplinan & DSS Poin Tata Tertib (Pasal 8)
* **Mutasi Poin Atomik**: Pencatatan pelanggaran dan penambahan `totalPoin` kumulatif siswa dibungkus dalam transaksi atomik database (`prisma.$transaction`) guna mencegah *race condition*.
* **Mesin Evaluasi Sanksi Otomatis (DSS Kumulatif)**:
  Sistem mengevaluasi status kedisiplinan siswa secara berjenjang berdasarkan akumulasi poin selama 3 tahun masa studi:
  * **0 – 49 Poin**: Status `Disiplin / Aman` (Pembinaan preventif).
  * **50 – 74 Poin**: Status `Peringatan 1` (Penerbitan Surat Peringatan I & konseling individu).
  * **75 – 99 Poin**: Status `Panggilan Orang Tua` (Penerbitan Surat Panggilan Resmi Orang Tua).
  * **$\ge$ 100 Poin**: Status `Ambang Kritis / Drop Out` (Rekomendasi Sidang Pleno Sekolah / Pengembalian Siswa ke Orang Tua).

### 3.3. Modul Asesmen & Pemetaan Penjurusan (DSS Kelas 11)
* **Angket Masalah Siswa (DCM / 99 Butir)**:
  * Instrumen cek masalah kualitatif mencakup bidang Pribadi, Sosial, Belajar, dan Karier.
  * Dilindungi validator Zod dengan mekanisme anti-duplikasi elemen array (`new Set(items).size === items.length`).
  * Dilengkapi fitur telaah kualitatif dan catatan tindak lanjut oleh Guru BK.
* **Gaya Belajar (VAK / 30 Butir)**:
  * Mengukur modalitas belajar: Visual ($V$), Auditori ($A$), dan Kinestetik ($K$).
  * Menyajikan visualisasi grafik persentase modalitas dan rekomendasi teknik belajar.
* **Minat & Bakat (RIASEC / 42 Butir)**:
  * Khusus siswa Kelas 10 untuk persiapan penjurusan Kelas 11 (*Grade-10 Eligibility Guard*).
  * Mengukur 6 dimensi John Holland (*Realistic*, *Investigative*, *Artistic*, *Social*, *Enterprising*, *Conventional*).
  * Menghasilkan **Kode Top-3** dan mencocokkannya ke peminatan:
    * Dominan $I / R / C$ $\rightarrow$ **MIPA** (Kedokteran, Rekayasa Teknik, Ilmu Komputer).
    * Dominan $E / S / C$ $\rightarrow$ **IPS** (Manajemen, Hukum, Ilmu Sosial).
    * Dominan $A / S$ $\rightarrow$ **Bahasa & Budaya** (Sastra, Desain Komunikasi Visual).
  * Algoritma kebal terhadap *division by zero* jika total skor bernilai nol.
* **Single-Submission Locking**: Siswa hanya dapat mengerjakan masing-masing asesmen sebanyak 1 kali untuk menjaga orisinalitas data.

### 3.4. Modul Konseling Interaktif
* **Single Active Session**: Siswa yang masih memiliki tiket konseling berstatus `PENDING` atau `DISETUJUI` dilarang membuat janji temu baru untuk mencegah *spamming/double booking*.
* **Alur Status Konseling**: `PENDING` $\rightarrow$ `DISETUJUI` / `DITOLAK` $\rightarrow$ `SELESAI`.
* **Kerahasiaan Catatan Konselor**: Catatan hasil konseling (`catatanGuruBK`) hanya dapat diisi dan diperbarui oleh Guru BK yang memiliki wewenang.

### 3.5. Keamanan Infrastruktur & Edge Protection
* **Distributed Rate Limiting (Upstash Redis)**:
  * `/api/auth/*`: Dibatasi **5 request / 1 menit** (Sliding Window) guna memitigasi *credential stuffing*.
  * `/api/siswa/assessment/*`: Dibatasi **15 request / 1 menit** guna mencegah manipulasi submission.
  * Dilengkapi mekanisme *fail-open* (jika Redis mengalami kendala, aplikasi tetap dapat diakses).
* **HTTP Security Headers (OWASP Compliant)**:
  * `X-Frame-Options: DENY` (Anti-Clickjacking).
  * `X-Content-Type-Options: nosniff` (Anti-MIME Sniffing).
  * `Strict-Transport-Security` (Enforce HTTPS).
  * `poweredByHeader: false` (Menyamarkan fingerprint server).

---

## 🏗️ 4. Arsitektur & Tech Stack

```
[ Client Browser / Frontend (Next.js) ]
                   │
                   ▼ (HTTPS)
[ Edge Middleware / Upstash Redis Rate Limiter ]
                   │
                   ▼
[ Next.js App Router API Handlers (Node.js Serverless) ]
                   │
                   ├─── (Argon2id / Web Crypto)
                   ├─── (Zod Schema Validation)
                   ▼
[ Prisma ORM 7 (@prisma/adapter-mariadb) ]
                   │ (connectionLimit: 1 per worker)
                   ▼
[ Database: MySQL / MariaDB (Optimized Indexes) ]
```

| Layer | Teknologi / Library | Keterangan & Peran |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Full-stack framework dengan arsitektur serverless/edge. |
| **Language** | TypeScript 5 | Static typing ketat dari layer UI hingga repository. |
| **Database ORM** | Prisma ORM 7 (`@prisma/client`) | Data modeling, relasi cascade, dan generator query typesafe. |
| **Driver Adapter**| `@prisma/adapter-mariadb` | Koneksi native MariaDB/MySQL dengan *connection pooling serverless*. |
| **Database Engine**| MySQL / MariaDB | Relational database dengan 9 tabel terindeks (`@@index`). |
| **Rate Limiter** | `@upstash/ratelimit` & `@upstash/redis` | Distributed sliding-window rate limiting via stateless HTTP REST. |
| **Kriptografi** | `argon2` & `node:crypto` | Hashing password standar industri & token random generator. |
| **Validasi Input**| `zod` | Skema validasi runtime untuk seluruh request body & query. |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Motion | Desain antarmuka modern, responsif, dan dinamis. |

---

## 📂 5. Struktur Direktori Proyek

```text
bk-26/
├── prisma/
│   ├── schema.prisma        # Skema basis data 9 tabel & indeks relasi
│   ├── seed.ts              # Data awal role, guru BK, dan siswa
│   └── sync-users.ts        # Utilitas migrasi/sinkronisasi akun user
├── src/
│   ├── app/
│   │   └── api/             # REST API Handlers Next.js App Router
│   │       ├── auth/        # Login, logout, me, change-password
│   │       ├── bk/          # Endpoint administratif Guru BK
│   │       ├── profile/     # Profil siswa login
│   │       └── siswa/       # Asesmen VAK, RIASEC, DCM, & konseling
│   ├── constants/           # Bank soal VAK, RIASEC, DCM, & matriks DSS
│   ├── generated/           # Client Prisma ter-generate
│   ├── lib/
│   │   ├── auth/            # requireAuth & helper verifikasi role
│   │   ├── prisma.ts        # Singleton Prisma client & serverless pooling
│   │   └── utils/           # Cookie helper, response formatter, crypto
│   ├── repositories/        # Layer akses data murni Prisma
│   ├── schemas/             # Skema validasi Zod (payload & filter)
│   ├── services/            # Business logic & DSS calculation engine
│   └── proxy.ts             # Logika Edge Rate Limiting Upstash Redis
├── next.config.ts           # Konfigurasi security headers & engine Next.js
└── package.json             # Manifes dependensi & script proyek
```

---

## 🛠️ 6. Panduan Instalasi & Menjalankan Proyek (Getting Started)

### Prasyarat Sistem
* **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan Node.js 20 LTS).
* **MySQL / MariaDB**: Server database aktif di lokal atau cloud.
* **Upstash Redis**: Akun Upstash gratis untuk kredensial REST URL & Token.

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/username/bk-26.git
cd bk-26
```

### Langkah 2: Instalasi Dependensi
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables
Salin template environment atau buat file `.env` di direktori root:

```env
# Mode Lingkungan
NODE_ENV="development"

# Konfigurasi Koneksi Database MySQL / MariaDB
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="your_password"
DB_NAME="bk_26_db"

# URL Koneksi Prisma (Digunakan untuk CLI migration/push)
DATABASE_URL="mysql://root:your_password@localhost:3306/bk_26_db?connection_limit=1"

# Kredensial Upstash Redis (Rate Limiter)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_rest_token"
```

### Langkah 4: Sinkronisasi & Migrasi Basis Data
Jalankan perintah generate client dan dorong skema ke server database:

```bash
# Generate Prisma Client
npx prisma generate

# Sinkronisasi skema tabel & indeks ke MySQL
npx prisma db push
```

*(Opsional)* Jalankan seeder untuk mengisi data master role, akun Guru BK, dan sampel siswa:
```bash
# Mengisi data role dan master akun
npm run db:seed

# Sinkronisasi akun pengguna berbasis NISN/NIP
npm run db:sync
```

### Langkah 5: Menjalankan Server Lokal
```bash
npm run dev
```
Aplikasi akan aktif dan dapat diakses di: `http://localhost:3000`.

---

## 🔐 7. Kredensial Awal Akun Default

Berdasarkan *seeder* bawaan sistem, akun awal dibuat menggunakan format standar berikut:

| Peran Akun | Username | Format Kata Sandi Awal | Catatan |
| :--- | :--- | :--- | :--- |
| **Guru BK** | NIP Guru BK (Contoh: `198501...`) | `${NIP}#sman26` | Wajib mengganti password di dashboard. |
| **Siswa** | NISN Siswa (Contoh: `007123...`) | `${NISN}#sman26` | Siswa Kelas 10 berhak mengerjakan RIASEC. |

---

## 🧪 8. Pengujian & Validasi Kualitas Kode

```bash
# Menjalankan linter kode
npm run lint

# Memperbaiki formatting dan issue linter otomatis
npm run lint:fix

# Menguji build produksi
npm run build
```

---

## 📄 9. Lisensi & Hak Cipta

Proyek ini dikembangkan khusus untuk **SMAN 26 Kabupaten Tangerang** sebagai bagian dari pengabdian masyarakat dan digitalisasi pendidikan. Seluruh hak cipta dilindungi undang-undang.
