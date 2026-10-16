export const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecCode = (typeof RIASEC_CODES)[number];

export interface RiasecDimensionDetail {
  kode: RiasecCode;
  nama: string;
  namaLengkap: string;
  deskripsi: string;
  karakteristik: string[];
  rekomendasiStudi: string[];
}

export const RIASEC_DETAILS: Record<RiasecCode, RiasecDimensionDetail> = {
  R: {
    kode: 'R',
    nama: 'Realistic',
    namaLengkap: 'Praktikal & Lapangan (Realistic)',
    deskripsi: 'Menyukai aktivitas fisik terukur, perkakas mesin, perakitan, dan kegiatan lapangan konkret.',
    karakteristik: ['Praktis dan mekanis', 'Suka pemecahan masalah konkret', 'Berorientasi hasil nyata'],
    rekomendasiStudi: ['Teknik Mesin', 'Teknik Sipil', 'Teknik Elektro', 'Teknologi Manufaktur'],
  },
  I: {
    kode: 'I',
    nama: 'Investigative',
    namaLengkap: 'Sains & Penelitian (Investigative)',
    deskripsi: 'Tertarik pada eksplorasi ilmiah, riset metodis, logika matematika, dan analisis data.',
    karakteristik: ['Kritis dan analitis', 'Suka teka-teki logika', 'Gemar eksperimen laboratorium'],
    rekomendasiStudi: ['Kedokteran & Farmasi', 'Ilmu Komputer', 'Sains Murni', 'Sains Data'],
  },
  A: {
    kode: 'A',
    nama: 'Artistic',
    namaLengkap: 'Seni & Kreativitas (Artistic)',
    deskripsi: 'Menyukai kebebasan berekspresi, orisinalitas ide, desain visual, sastra, dan media estetika.',
    karakteristik: ['Ekspresif dan imajinatif', 'Sensitif terhadap estetika visual', 'Menyukai proyek kreatif'],
    rekomendasiStudi: ['Desain Komunikasi Visual (DKV)', 'Sastra & Linguistik', 'Arsitektur', 'Animasi'],
  },
  S: {
    kode: 'S',
    nama: 'Social',
    namaLengkap: 'Sosial & Edukasi (Social)',
    deskripsi: 'Tertarik pada hubungan antarpribadi, membantu orang lain, mengajar, dan pemberdayaan.',
    karakteristik: ['Empati tinggi dan komunikatif', 'Kooperatif dalam tim', 'Menyukai kegiatan kemanusiaan'],
    rekomendasiStudi: ['Psikologi', 'Bimbingan Konseling / FKIP', 'Ilmu Komunikasi', 'Hubungan Internasional'],
  },
  E: {
    kode: 'E',
    nama: 'Enterprising',
    namaLengkap: 'Bisnis & Kepemimpinan (Enterprising)',
    deskripsi: 'Menyukai kepemimpinan, negosiasi, kewirausahaan, dan pengambilan keputusan terukur.',
    karakteristik: ['Percaya diri dan persuasif', 'Berjiwa pemimpin', 'Termotivasi target keberhasilan'],
    rekomendasiStudi: ['Manajemen Bisnis', 'Ilmu Hukum', 'Ekonomi Pembangunan', 'Kewirausahaan'],
  },
  C: {
    kode: 'C',
    nama: 'Conventional',
    namaLengkap: 'Terstruktur & Data (Conventional)',
    deskripsi: 'Tertarik pada keteraturan data terperinci, pengarsipan sistematis, akuntansi, dan prosedur baku.',
    karakteristik: ['Teliti dan cermat pada angka', 'Menyukai panduan SOP yang jelas', 'Manajemen data teratur'],
    rekomendasiStudi: ['Akuntansi & Keuangan', 'Sistem Informasi', 'Administrasi Perkantoran', 'Perpajakan'],
  },
};

export interface SoalRiasec {
  id: number;
  dimensi: RiasecCode;
  pertanyaan: string;
}

// Dikosongkan sementara, siap diisi saat ada butir resmi sekolah
export const BANK_SOAL_RIASEC: SoalRiasec[] = [
  { id: 1, dimensi: 'R', pertanyaan: 'Contoh butir pertanyaan dimensi R...' },
];

export interface JurusanDetail {
  kodeJurusan: 'MIPA' | 'IPS' | 'Bahasa & Budaya';
  namaLengkap: string;
  deskripsi: string;
  rumpunIlmu: string[];
  karirProspektif: string[];
}

export const REKOMENDASI_JURUSAN: Record<string, JurusanDetail> = {
  MIPA: {
    kodeJurusan: 'MIPA',
    namaLengkap: 'Matematika & Ilmu Pengetahuan Alam (MIPA)',
    deskripsi: 'Fokus pada penalaran matematis, metodologi ilmiah empiris, sains eksperimental, dan teknologi.',
    rumpunIlmu: ['Kedokteran & Kesehatan', 'Teknologi Informasi & Software', 'Teknik Mesin/Sipil/Industri', 'Sains Murni'],
    karirProspektif: ['Dokter / Tenaga Medis', 'Software Engineer', 'Insinyur Teknik', 'Peneliti Sains'],
  },
  IPS: {
    kodeJurusan: 'IPS',
    namaLengkap: 'Ilmu Pengetahuan Sosial (IPS)',
    deskripsi: 'Fokus pada dinamika kemasyarakatan, perekonomian, tata kelola kepemimpinan, dan bisnis.',
    rumpunIlmu: ['Manajemen & Bisnis', 'Ilmu Hukum', 'Akuntansi & Perbankan', 'Hubungan Internasional'],
    karirProspektif: ['Manajer Perusahaan', 'Advokat / Konsultan Hukum', 'Akuntan Publik', 'Diplomat'],
  },
  BAHASA: {
    kodeJurusan: 'Bahasa & Budaya',
    namaLengkap: 'Ilmu Bahasa & Budaya',
    deskripsi: 'Fokus pada kemahiran linguistik, komunikasi lintas budaya, ekspresi sastra, dan media kreatif.',
    rumpunIlmu: ['Sastra & Linguistik Asing', 'Desain Komunikasi Visual (DKV)', 'Jurnalistik', 'Pariwisata'],
    karirProspektif: ['Penerjemah Internasional', 'Content Creator / Copywriter', 'Desainer Grafis', 'Jurnalis'],
  },
};

/**
 * DSS Engine Penjurusan Kelas 11 SMAN 26:
 * 1. Dominan C (Top 1 adalah C) -> Bahasa & Budaya
 * 2. Dominan R, I, A (Top 1 adalah R/I/A) -> MIPA
 * 3. Klaster S, E (Top 1 adalah S/E):
 *    - Jika didukung kuat oleh C (Top 2 adalah C) -> Bahasa & Budaya
 *    - Selain itu -> IPS
 */
export function matchRekomendasiJurusan(
  top1: RiasecCode,
  top2: RiasecCode,
  top3: RiasecCode
): JurusanDetail {
  // 1. Kondisi Khusus: C paling tinggi -> Bahasa & Budaya
  if (top1 === 'C') {
    return REKOMENDASI_JURUSAN.BAHASA;
  }

  // 2. Klaster IPA: R, I, A di urutan pertama -> MIPA
  if (top1 === 'R' || top1 === 'I' || top1 === 'A') {
    return REKOMENDASI_JURUSAN.MIPA;
  }

  // 3. Klaster IPS: S atau E di urutan pertama
  if (top1 === 'S' || top1 === 'E') {
    // Membaca top2 dan top3 agar variabel terpakai
    if (top2 === 'C' || top3 === 'C') {
      return REKOMENDASI_JURUSAN.BAHASA;
    }
    return REKOMENDASI_JURUSAN.IPS;
  }

  return REKOMENDASI_JURUSAN.IPS;
}