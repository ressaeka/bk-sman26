# Product Requirement Document (PRD)

**Sistem Informasi Bimbingan Konseling & Layanan Asesmen Terpadu (SMAN 26 Kabupaten Tangerang)**

* **Versi Dokumen:** 2.0 (Final Architecture & Technical Specification)
* **Tanggal Penyusunan:** 16 Oktober 2026
* **Target Rilis / Production:** 5 November 2026
* **Target Pengguna:** Siswa & Guru Bimbingan Konseling (BK) SMAN 26 Kabupaten Tangerang

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Sistem Informasi Bimbingan Konseling (BK-26) merupakan platform layanan terpadu berbasis web yang mendigitalkan seluruh alur asesmen siswa, rekapitulasi poin pelanggaran berbasis *Decision Support System* (DSS), serta penjadwalan bimbingan konseling secara terstruktur dan tertutup.

Tujuan implementasi sistem ini:

* Menyediakan instrumen asesmen mandiri digital: Gaya Belajar (VAK), Minat & Bakat (RIASEC untuk penjurusan Kelas 10 ke 11), dan Angket Masalah Kualitatif (AKPD).
* Menerapkan DSS Engine untuk kalkulasi otomatis modalitas belajar, rekomendasi peminatan kelas 11, serta evaluasi sanksi kumulatif siswa (ambang batas SP 50 poin, Panggilan 75 poin, hingga rekomendasi *Drop Out* 100 poin).
* Menghadirkan portal pengajuan dan manajemen sesi konseling yang transparan dan terjadwal antara siswa dan Guru BK.
* Mengadopsi arsitektur *Headless REST API* modular dengan skema basis data ringkas (9 tabel) berbasis MySQL dan Prisma ORM.

---

## 2. Hak Akses Pengguna (Role-Based Access Control)

| Role | Identitas Akun | Hak Akses & Fungsionalitas Utama |
| --- | --- | --- |
| **SISWA** | Username: NISN | Login terpadu, mengubah kata sandi mandiri, mengerjakan asesmen Gaya Belajar (VAK), Minat Bakat RIASEC (khusus kelas 10), mencentang daftar kendala AKPD, memantau poin kedisiplinan kumulatif, serta mengajukan janji temu konseling. |
| **BK** | Username: NIP (2 Akun) | Login terpadu, memantau rekapitulasi asesmen siswa per kelas, menelaah dan memberikan catatan kualitatif pada tes diagnostik AKPD, mencatat pelanggaran indisipliner siswa beserta evaluasi DSS, serta menyetujui, menolak, atau menyelesaikan sesi konseling. |

---

## 3. Spesifikasi Fungsional & Alur Bisnis

### 3.1. Modul Autentikasi Universal & Sesi

* **Unified Login:** Satu form login universal tanpa selektor peran. Siswa memasukkan NISN, Guru BK memasukkan NIP.
* **Kredensial Awal:**
* Siswa: `${nisn}` / `${nisn}#sman26`
* Guru BK: `${nip}` / `${nip}#sman26`


* **Keamanan:** Password di-hash menggunakan algoritma **Argon2**.
* **Manajemen Sesi:** Token sesi 256-bit disimpan terenkripsi SHA-256 pada tabel `session`, diinjeksikan melalui cookie *HttpOnly* (`bk_session_token`) dengan masa berlaku 7 hari.
* **Awareness Password:** Kolom `mustChangePassword: true` menampilkan banner peringatan oranye di dashboard hingga siswa mengganti kata sandi.

### 3.2. Modul Asesmen Gaya Belajar (VAK)

* **Karakteristik:** 30 butir pertanyaan dengan 3 opsi pilihan (A=Visual, B=Auditori, C=Kinestetik). Bank soal disimpan statis di file konstanta.
* **DSS Engine (Kalkulasi Skor):**
* Akumulasi skor $V$, $A$, dan $K$ dari jawaban siswa.
* Menentukan nilai tertinggi sebagai **Gaya Belajar Dominan**.


* **Penyimpanan:** Menyimpan 1 baris rekapitulasi langsung ke tabel `gaya_belajar` (`skorV`, `skorA`, `skorK`, `dominan`, `siswaId`).
* **Output Antarmuka:** Visualisasi bar persentase VAK dan rekomendasi strategi belajar resmi dari BK.

### 3.3. Modul Asesmen Minat & Bakat (RIASEC) — Khusus Kelas 10 ke Kelas 11

* **Tujuan Khusus:** Instrumen objektif pemetaan peminatan/penjurusan siswa Kelas 10 menuju Kelas 11 (MIPA, IPS, atau Bahasa & Budaya).
* **Eligibility Guard:** Pengecekan otomatis kolom `rombel`. Jika siswa bukan rombel tingkat 10, akses tes dikunci.
* **DSS Engine (Analisis Bakat):**
* Menghitung total skor 6 dimensi John Holland: *Realistic* ($R$), *Investigative* ($I$), *Artistic* ($A$), *Social* ($S$), *Enterprising* ($E$), dan *Conventional* ($C$).
* Mengurutkan dan mengambil 3 skor teratas untuk menyusun **Kode Top 3** (contoh: `I-R-C`).
* Mencocokkan Kode Top 3 dengan matriks aturan:
* Dominan $I / R / C$ $\rightarrow$ **MIPA** (Kedokteran, IT, Teknik).
* Dominan $E / S / C$ $\rightarrow$ **IPS** (Manajemen, Hukum, Akuntansi).
* Dominan $A / S$ $\rightarrow$ **Bahasa & Budaya** (Sastra, Komunikasi, DKV).




* **Penyimpanan:** Menyimpan 1 baris ke tabel `minat_bakat` (`kodeTop3`, `rekomendasi`, skor 6 dimensi, `siswaId`).

### 3.4. Modul Tes Diagnostik Kualitatif (AKPD / Masalah Siswa)

* **Karakteristik:** Instrumen non-kognitif, **tanpa sistem skor numerik**.
* **Struktur Kategori:** Masalah dikelompokkan ke dalam 4 bidang: Pribadi, Sosial, Belajar, dan Karier. Daftar butir pernyataan disimpan di file konstanta.
* **Alur Siswa:** Siswa hanya mencentang butir kendala yang dialami dan dapat melampirkan cerita bebas. Data yang disimpan ke database **hanya butir yang dicentang** (format JSON) dengan status `statusReview = "PENDING"`.
* **Alur Guru BK:** Guru BK membaca daftar kendala yang dicentang siswa, memberikan telaah kualitatif/solusi pada kolom `catatanGuruBK`, lalu mengubah status menjadi `"DIREVIEW"` atau `"TINDAK_LANJUT"`.

### 3.5. Modul Layanan Konseling

* **Siklus Status:** Berjalan dengan alur status: `PENDING` $\rightarrow$ `DISETUJUI` / `DITOLAK` $\rightarrow$ `SELESAI`.
* **Pengajuan Siswa:** Menginput tanggal, jam, topik (Belajar, Pribadi, Karier), dan keluhan.
* **Penanganan BK:** Guru BK mengonfirmasi permohonan, melaksanakan konseling tatap muka, dan mencatat rekap hasil pembinaan pada kolom `catatanGuruBK` sebelum menutup sesi menjadi `SELESAI`.

### 3.6. Modul Pelanggaran & Poin Disiplin (DSS Engine Kumulatif)

* **Aktor Penginput:** Khusus Guru BK.
* **Masa Akumulasi:** Poin bersifat kumulatif selama 3 tahun masa studi siswa (Kelas X sampai XII).
* **Transaksi Data:** Eksekusi transaksi atomik Prisma: mencatat riwayat ke tabel `pelanggaran` dan mengakumulasikan nilai `totalPoin` pada tabel `siswa`.
* **Evaluasi Aturan DSS Kumulatif:**
* **Poin 0 – 49:** Status **`AMAN`** (Kondisi baik, pembinaan rutin di kelas).
* **Poin 50 – 74:** Status **`SP_1`** (Penerbitan Surat Peringatan 1 & konseling individu).
* **Poin 75 – 99:** Status **`PANGGILAN_ORTU`** (Penerbitan Surat Panggilan Resmi Orang Tua ke Sekolah).
* **Poin $\ge$ 100:** Status **`DROP_OUT`** (Ambang batas kritis: Rekomendasi Sidang Pleno / Pengembalian Siswa ke Orang Tua).



---

## 4. Skema Basis Data Final (9 Tabel)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// 1. AUTENTIKASI & AKUN
model role {
  id        Int      @id @default(autoincrement())
  nama_role String   @unique @db.VarChar(50)
  createdAt DateTime @default(now()) @db.DateTime(0)
  updatedAt DateTime @default(now()) @db.DateTime(0)
  user      user[]

  @@map("role")
}

model user {
  id                 Int        @id @default(autoincrement())
  username           String     @unique @db.VarChar(150)
  passwordHash       String     @db.VarChar(255)
  roleId             Int
  siswaId            Int?       @unique
  counselorId        Int?       @unique
  isActive           Boolean    @default(true)
  mustChangePassword Boolean    @default(true)
  createdAt          DateTime   @default(now()) @db.DateTime(0)
  updatedAt          DateTime   @default(now()) @db.DateTime(0)

  role               role       @relation(fields: [roleId], references: [id])
  siswa              siswa?     @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  counselor          counselor? @relation(fields: [counselorId], references: [id], onDelete: Cascade)
  session            session[]

  @@index([roleId])
  @@map("user")
}

model session {
  id        Int      @id @default(autoincrement())
  userId    Int
  tokenHash String   @unique @db.VarChar(255)
  expiresAt DateTime @db.DateTime(0)
  createdAt DateTime @default(now()) @db.DateTime(0)

  user      user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("session")
}

// 2. PROFIL PENGGUNA
model counselor {
  id             Int             @id @default(autoincrement())
  nip            String?         @unique @db.VarChar(50)
  nama_counselor String          @db.VarChar(150)
  createdAt      DateTime        @default(now()) @db.DateTime(0)
  updatedAt      DateTime        @default(now()) @db.DateTime(0)

  user           user?
  pelanggaran    Pelanggaran[]
  tesDiagnostik  TesDiagnostik[]
  konseling      Konseling[]

  @@map("counselor")
}

model siswa {
  id            Int             @id @default(autoincrement())
  nipd          String?         @db.VarChar(50)
  nisn          String          @unique @db.VarChar(50)
  nama_siswa    String?         @db.VarChar(150)
  jenis_kelamin String?         @db.Char(1)
  rombel        String?         @db.VarChar(50)
  tanggal_lahir DateTime?       @db.Date
  agama         String?         @db.VarChar(50)
  alamat        String?         @db.Text
  totalPoin     Int             @default(0)
  createdAt     DateTime        @default(now()) @db.DateTime(0)
  updatedAt     DateTime        @default(now()) @db.DateTime(0)

  user          user?
  pelanggaran   Pelanggaran[]
  gayaBelajar   GayaBelajar[]
  tesDiagnostik TesDiagnostik[]
  minatBakat    MinatBakat[]
  konseling     Konseling[]

  @@map("siswa")
}

// 3. FITUR ASESMEN & DSS
model Pelanggaran {
  id               Int        @id @default(autoincrement())
  siswaId          Int
  counselorId      Int?
  jenisPelanggaran String     @db.VarChar(255)
  poin             Int
  keterangan       String?    @db.Text
  createdAt        DateTime   @default(now()) @db.DateTime(0)

  siswa            siswa      @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  counselor        counselor? @relation(fields: [counselorId], references: [id], onDelete: SetNull)

  @@index([siswaId])
  @@index([counselorId])
  @@map("pelanggaran")
}

model GayaBelajar {
  id        Int      @id @default(autoincrement())
  siswaId   Int
  skorV     Int
  skorA     Int
  skorK     Int
  dominan   String   @db.VarChar(50)
  createdAt DateTime @default(now()) @db.DateTime(0)

  siswa     siswa    @relation(fields: [siswaId], references: [id], onDelete: Cascade)

  @@index([siswaId])
  @@map("gaya_belajar")
}

model TesDiagnostik {
  id             Int        @id @default(autoincrement())
  siswaId        Int
  counselorId    Int?
  daftarMasalah  String     @db.Text
  ceritaTambahan String?    @db.Text
  statusReview   String     @default("PENDING") @db.VarChar(20)
  catatanGuruBK  String?    @db.Text
  reviewedAt     DateTime?  @db.DateTime(0)
  createdAt      DateTime   @default(now()) @db.DateTime(0)

  siswa          siswa      @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  counselor      counselor? @relation(fields: [counselorId], references: [id], onDelete: SetNull)

  @@index([siswaId])
  @@index([counselorId])
  @@map("tes_diagnostik")
}

model MinatBakat {
  id          Int      @id @default(autoincrement())
  siswaId     Int
  kodeTop3    String   @db.VarChar(10)
  rekomendasi String   @db.VarChar(150)
  skorR       Int      @default(0)
  skorI       Int      @default(0)
  skorA       Int      @default(0)
  skorS       Int      @default(0)
  skorE       Int      @default(0)
  skorC       Int      @default(0)
  createdAt   DateTime @default(now()) @db.DateTime(0)

  siswa       siswa    @relation(fields: [siswaId], references: [id], onDelete: Cascade)

  @@index([siswaId])
  @@map("minat_bakat")
}

// 4. SESI KONSELING
model Konseling {
  id            Int        @id @default(autoincrement())
  siswaId       Int
  counselorId   Int?
  tanggal       DateTime   @db.Date
  jam           String     @db.VarChar(10)
  topik         String     @db.VarChar(150)
  keluhan       String?    @db.Text
  status        String     @default("PENDING") @db.VarChar(20)
  catatanGuruBK String?    @db.Text
  createdAt     DateTime   @default(now()) @db.DateTime(0)
  updatedAt     DateTime   @default(now()) @db.DateTime(0)

  siswa         siswa      @relation(fields: [siswaId], references: [id], onDelete: Cascade)
  counselor     counselor? @relation(fields: [counselorId], references: [id], onDelete: SetNull)

  @@index([siswaId])
  @@index([counselorId])
  @@map("konseling")
}

```

---

## 5. Rincian Endpoint REST API

Standar Format Respons:

```json
{
  "success": true,
  "message": "Operasi berhasil",
  "data": {}
}

```

### 5.1. Autentikasi

* `POST /api/auth/login`: Menerima `{ username, password }`, memvalidasi hash Argon2, menghasilkan token sesi, dan menyetel cookie *HttpOnly*.
* `POST /api/auth/logout`: Menghapus baris sesi pada basis data dan membersihkan cookie klien.
* `GET /api/auth/me`: Mengembalikan data profil siswa atau konselor yang sedang login.
* `POST /api/auth/change-password`: Menerima `{ oldPassword, newPassword }`, memperbarui hash, dan mengubah flag `mustChangePassword = false`.

### 5.2. Asesmen & Konseling Siswa

* `POST /api/siswa/assessment/gaya-belajar/submit`: Menerima larik jawaban VAK, menghitung bobot skor, dan menyimpan data ke tabel `GayaBelajar`.
* `GET /api/siswa/assessment/gaya-belajar/result`: Mengambil rekapitulasi skor VAK dan gaya belajar dominan siswa aktif.
* `POST /api/siswa/assessment/minat-bakat/submit`: Menerima jawaban RIASEC, menghitung 6 dimensi, membentuk Kode Top 3, dan menyimpan rekomendasi jurusan ke tabel `MinatBakat`.
* `GET /api/siswa/assessment/minat-bakat/result`: Mengambil grafik radar RIASEC dan pemetaan peminatan kelas 11.
* `POST /api/siswa/assessment/diagnostik/submit`: Menerima daftar checklist masalah siswa dan menyimpannya berstatus `PENDING`.
* `GET /api/siswa/assessment/diagnostik/result`: Mengambil status review dan catatan evaluasi dari Guru BK.
* `POST /api/siswa/konseling`: Mengajukan permohonan sesi konseling (tanggal, jam, topik, keluhan).
* `GET /api/siswa/konseling/history`: Mengambil riwayat pengajuan sesi konseling milik siswa.

### 5.3. Manajemen & DSS Guru BK

* `POST /api/bk/pelanggaran`: Menginput jenis pelanggaran dan poin siswa, mengakumulasikan nilai pada tabel siswa, serta mengembalikan status DSS (`AMAN`, `SP_1`, `PANGGILAN_ORTU`, atau `DROP_OUT`).
* `GET /api/bk/konseling`: Mengambil seluruh daftar permohonan konseling siswa.
* `PATCH /api/bk/konseling/:id`: Memperbarui status konseling (`DISETUJUI`, `DITOLAK`, atau `SELESAI`) serta menyimpan catatan penanganan.
* `PATCH /api/bk/diagnostik/:id/review`: Menyimpan catatan evaluasi kualitatif Guru BK terhadap kendala siswa.
* `GET /api/bk/rekap/assessment`: Rekapitulasi hasil VAK dan peminatan RIASEC per kelas/rombel.
* `GET /api/bk/rekap/pelanggaran`: Rekapitulasi poin kedisiplinan dan daftar siswa yang berada di ambang sanksi SP atau Drop Out.

---

## 6. Struktur Direktori Proyek Backend (`bk-26`)

```text
bk-26/
├── prisma/
│   ├── schema.prisma                       # Skema final 9 tabel MySQL
│   ├── seed.ts                             # Seeding Role, 2 Guru BK, & Siswa awal
│   └── sync-users.ts                       # Skrip sinkronisasi massal user NISN/NIP riil
│
├── src/
│   ├── app/
│   │   ├── route.ts                        # GET / (Health Check Server)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── me/route.ts
│   │       │   └── change-password/route.ts
│   │       ├── siswa/
│   │       │   ├── assessment/
│   │       │   │   ├── gaya-belajar/
│   │       │   │   │   ├── submit/route.ts
│   │       │   │   │   └── result/route.ts
│   │       │   │   ├── minat-bakat/
│   │       │   │   │   ├── submit/route.ts
│   │       │   │   │   └── result/route.ts
│   │       │   │   └── diagnostik/
│   │       │   │       ├── submit/route.ts
│   │       │   │       └── result/route.ts
│   │       │   └── konseling/
│   │       │       ├── route.ts
│   │       │       └── history/route.ts
│   │       └── bk/
│   │           ├── pelanggaran/route.ts
│   │           ├── konseling/
│   │           │   ├── route.ts
│   │           │   └── [id]/route.ts
│   │           ├── diagnostik/[id]/review/route.ts
│   │           └── rekap/
│   │               ├── assessment/route.ts
│   │               └── pelanggaran/route.ts
│   │
│   ├── schemas/                            # Validasi Payload Zod
│   │   ├── auth.schema.ts
│   │   ├── gaya-belajar.schema.ts
│   │   ├── minat-bakat.schema.ts
│   │   ├── diagnostik.schema.ts
│   │   ├── konseling.schema.ts
│   │   └── pelanggaran.schema.ts
│   │
│   ├── services/                           # Pure Business Logic & DSS Engine
│   │   ├── auth.service.ts
│   │   ├── gaya-belajar.service.ts
│   │   ├── minat-bakat.service.ts
│   │   ├── diagnostik.service.ts
│   │   ├── konseling.service.ts
│   │   └── pelanggaran.service.ts
│   │
│   ├── repositories/                       # Akses Basis Data Prisma Murni
│   │   ├── user.repository.ts
│   │   ├── session.repository.ts
│   │   ├── student.repository.ts
│   │   ├── counselor.repository.ts
│   │   ├── gaya-belajar.repository.ts
│   │   ├── minat-bakat.repository.ts
│   │   ├── diagnostik.repository.ts
│   │   ├── konseling.repository.ts
│   │   └── pelanggaran.repository.ts
│   │
│   ├── constants/                          # Bank Soal Statis, Enum, & Narasi
│   │   ├── auth.constant.ts
│   │   ├── gaya-belajar.constant.ts        # 30 Soal VAK & Interpretasi
│   │   ├── minat-bakat.constant.ts         # Butir RIASEC & Matriks Aturan Jurusan
│   │   ├── diagnostik.constant.ts          # Master Butir Masalah 4 Bidang
│   │   ├── konseling.constant.ts
│   │   └── pelanggaran.constant.ts         # Aturan DSS: 50, 75, 100 Poin
│   │
│   └── lib/                                # Utilitas Bersama & Keamanan
│       ├── prisma.ts                       # Singleton PrismaClient
│       ├── auth/
│       │   ├── require-auth.ts
│       │   └── require-role.ts
│       └── utils/
│           ├── date.ts                     # Format Waktu Asia/Jakarta (WIB)
│           └── response.ts

```

---

## 7. Timeline Eksekusi Menuju Rilis (5 November 2026)

* **16 – 18 Oktober 2026 (Pondasi Data):** Eksekusi `npx prisma db push`, jalankan `seed.ts` (akun 2 Guru BK & siswa awal), pisahkan kode UI ke folder `arsip-fe/`, dan pastikan server API berjalan sehat.
* **19 – 24 Oktober 2026 (Penyelesaian Core API):** Pembangunan *repository*, *service*, dan rute API untuk ketiga modul asesmen (VAK, RIASEC, AKPD) serta DSS Pelanggaran. Pengujian penuh seluruh endpoint via Postman.
* **25 – 29 Oktober 2026 (Konseling & Rekap BK):** Implementasi API alur konseling, telaah diagnostik, serta rekapitulasi data peminatan dan kedisiplinan Guru BK.
* **30 Oktober – 2 November 2026 (Integrasi Frontend):** Pemindahan komponen antarmuka dari `arsip-fe/` ke `src/app/`, penyambungan pemanggilan `fetch()` ke endpoint yang sudah tervalidasi.
* **3 – 4 November 2026 (Uji Coba Data Riil & Final Polish):** Sinkronisasi data asli sekolah lewat `sync-users.ts`, pengujian akhir skenario pengguna (*smoke test*), dan persiapan deployment.
* **5 November 2026 (Production & Go-Live):** Deployment aplikasi ke server sekolah dan serah terima sistem.