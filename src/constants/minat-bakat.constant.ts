export const RIASEC_CODES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecCode = (typeof RIASEC_CODES)[number];

export interface RiasecDimensionDetail {
  kode: RiasecCode;
  nama: string;
  namaLengkap: string;
  deskripsi: string;
  bidangProfesi: string[];
  jalurBimbinganKarir: string[];
}

export const RIASEC_DETAILS: Record<RiasecCode, RiasecDimensionDetail> = {
  R: {
    kode: 'R',
    nama: 'Realistic',
    namaLengkap: 'Praktikal & Lapangan (Realistic)',
    deskripsi: 'Menyukai aktivitas fisik terukur, perkakas mesin, perakitan, dan kegiatan lapangan konkret.',
    bidangProfesi: [
      'Pertanian',
      'Asisten Kesehatan',
      'Komputer',
      'Konstruksi',
      'Mekanik',
      'Pariwisata',
    ],
    jalurBimbinganKarir: [
      'Sumber daya alam',
      'Layanan kesehatan',
      'Teknik industri',
      'Rekayasa teknologi',
      'Seni pertunjukan',
    ],
  },
  I: {
    kode: 'I',
    nama: 'Investigative',
    namaLengkap: 'Sains & Penelitian (Investigative)',
    deskripsi: 'Tertarik pada eksplorasi ilmiah, riset metodis, logika matematika, dan analisis data.',
    bidangProfesi: [
      'Kelautan',
      'Teknik',
      'Kimia',
      'Kedokteran hewan',
      'Peternakan',
      'Kedokteran',
      'Ekonomi',
      'Psikologi',
      'Fisika',
      'Matematika',
      'Biologi',
      'Hukum',
    ],
    jalurBimbinganKarir: [
      'Layanan kesehatan',
      'Bisnis',
      'Pekerja sosial',
      'Teknik Industri',
      'Rekayasa teknologi',
    ],
  },
  A: {
    kode: 'A',
    nama: 'Artistic',
    namaLengkap: 'Seni & Kreativitas (Artistic)',
    deskripsi: 'Menyukai kebebasan berekspresi, orisinalitas ide, desain visual, sastra, dan media estetika.',
    bidangProfesi: [
      'Komunikasi',
      'Kecantikan',
      'Seni',
      'Sastra',
      'Fotografi',
      'Penyiaran',
      'Desain interior',
      'Arsitektur',
      'Desain komunikasi visual',
    ],
    jalurBimbinganKarir: [
      'Pekerja sosial',
      'Seni',
      'Komunikasi',
    ],
  },
  S: {
    kode: 'S',
    nama: 'Social',
    namaLengkap: 'Sosial & Edukasi (Social)',
    deskripsi: 'Tertarik pada hubungan antarpribadi, membantu orang lain, mengajar, dan pemberdayaan.',
    bidangProfesi: [
      'Konseling',
      'Keperawatan',
      'Terapi fisik',
      'Layanan wisata',
      'Periklanan',
      'Public Relation',
      'Pendidikan',
    ],
    jalurBimbinganKarir: [
      'Layanan kesehatan',
      'Pekerja sosial',
    ],
  },
  E: {
    kode: 'E',
    nama: 'Enterprising',
    namaLengkap: 'Bisnis & Kepemimpinan (Enterprising)',
    deskripsi: 'Menyukai kepemimpinan, negosiasi, kewirausahaan, dan pengambilan keputusan terukur.',
    bidangProfesi: [
      'Bisnis',
      'Real Estate',
      'Pemasaran',
      'Hukum',
      'Sosial Politik',
      'Perdagangan internasional',
      'Finansial/perbankan',
    ],
    jalurBimbinganKarir: [
      'Bisnis',
      'Pekerja sosial',
      'Seni',
      'Komunikasi',
    ],
  },
  C: {
    kode: 'C',
    nama: 'Conventional',
    namaLengkap: 'Terstruktur & Data (Conventional)',
    deskripsi: 'Tertarik pada keteraturan data terperinci, pengarsipan sistematis, akuntansi, dan prosedur baku.',
    bidangProfesi: [
      'Akuntansi',
      'Asuransi',
      'Administrasi',
      'Banking',
      'Data processing',
    ],
    jalurBimbinganKarir: [
      'Layanan kesehatan',
      'Bisnis',
      'Teknik Industri',
      'Teknologi Informasi',
    ],
  },
};

export interface SoalRiasec {
  id: number;
  dimensi: RiasecCode;
  pertanyaan: string;
}

export const BANK_SOAL_RIASEC: SoalRiasec[] = [
  { id: 1, dimensi: 'R', pertanyaan: 'Aku suka mengulik peralatan' },
  { id: 2, dimensi: 'I', pertanyaan: 'Aku suka mengerjakan puzzle' },
  { id: 3, dimensi: 'E', pertanyaan: 'Aku suka bekerja mandiri' },
  { id: 4, dimensi: 'S', pertanyaan: 'Aku suka bekerja dalam kelompok' },
  { id: 5, dimensi: 'E', pertanyaan: 'Aku suka membuat target untuk diriku sendiri' },
  { id: 6, dimensi: 'C', pertanyaan: 'Aku suka merapikan barang-barang (buku, alat tulis, kamar)' },
  { id: 7, dimensi: 'R', pertanyaan: 'Aku suka menyusun balok/ LEGO' },
  { id: 8, dimensi: 'A', pertanyaan: 'Aku suka membaca buku tentang seni dan musik' },
  { id: 9, dimensi: 'C', pertanyaan: 'Aku suka mengerjakan hal-hal dengan instruksi yang jelas' },
  { id: 10, dimensi: 'E', pertanyaan: 'Aku suka meyakinkan teman untuk mengikuti caraku' },
  { id: 11, dimensi: 'I', pertanyaan: 'Aku suka melakukan percobaan/eksperimen' },
  { id: 12, dimensi: 'S', pertanyaan: 'Aku suka menjelaskan sesuatu kepada teman' },
  { id: 13, dimensi: 'S', pertanyaan: 'Aku suka membantu orang lain memecahkan persoalan' },
  { id: 14, dimensi: 'R', pertanyaan: 'Aku suka memelihara binatang' },
  { id: 15, dimensi: 'C', pertanyaan: 'Aku tidak berkeberatan bekerja melebihi waktu yang ditentukan' },
  { id: 16, dimensi: 'E', pertanyaan: 'Aku suka menjual sesuatu' },
  { id: 17, dimensi: 'A', pertanyaan: 'Aku suka membuat karya berbentuk tulisan' },
  { id: 18, dimensi: 'I', pertanyaan: 'Aku suka sains' },
  { id: 19, dimensi: 'E', pertanyaan: 'Aku suka mendapatkan tantangan baru' },
  { id: 20, dimensi: 'S', pertanyaan: 'Aku suka menghibur teman' },
  { id: 21, dimensi: 'R', pertanyaan: 'Aku suka mencari tahu cara kerja sebuah alat' },
  { id: 22, dimensi: 'R', pertanyaan: 'Aku suka merangkaikan atau merakit benda' },
  { id: 23, dimensi: 'A', pertanyaan: 'Aku adalah orang yang kreatif' },
  { id: 24, dimensi: 'C', pertanyaan: 'Aku suka memperhatikan detail' },
  { id: 25, dimensi: 'C', pertanyaan: 'Aku suka merapikan catatan atau LKS' },
  { id: 26, dimensi: 'I', pertanyaan: 'Aku suka mencari tahu penyebab suatu kejadian' },
  { id: 27, dimensi: 'A', pertanyaan: 'Aku suka memainkan alat musik atau bernyanyi' },
  { id: 28, dimensi: 'A', pertanyaan: 'Aku suka mempelajari budaya berbagai daerah' },
  { id: 29, dimensi: 'E', pertanyaan: 'Aku ingin membuka usaha sendiri suatu saat nanti' },
  { id: 30, dimensi: 'A', pertanyaan: 'Aku suka memasak' },
  { id: 31, dimensi: 'A', pertanyaan: 'Aku suka bermain peran/drama' },
  { id: 32, dimensi: 'R', pertanyaan: 'Aku suka mempraktikkan hal-hal yang aku pelajari' },
  { id: 33, dimensi: 'I', pertanyaan: 'Aku suka mengerjakan soal matematika atau grafik' },
  { id: 34, dimensi: 'S', pertanyaan: 'Aku suka mendiskusikan hal-hal yang terjadi di sekitarku' },
  { id: 35, dimensi: 'C', pertanyaan: 'Aku suka merapikan kamarku' },
  { id: 36, dimensi: 'E', pertanyaan: 'Aku suka memimpin kelompok atau kelas' },
  { id: 37, dimensi: 'R', pertanyaan: 'Aku suka berkegiatan di luar ruangan' },
  { id: 38, dimensi: 'C', pertanyaan: 'Aku suka berkegiatan di dalam ruangan dengan meja-kursi' },
  { id: 39, dimensi: 'I', pertanyaan: 'Aku suka menghitung' },
  { id: 40, dimensi: 'S', pertanyaan: 'Aku suka menolong orang' },
  { id: 41, dimensi: 'A', pertanyaan: 'Aku suka menggambar' },
  { id: 42, dimensi: 'S', pertanyaan: 'Aku suka berbicara di depan umum' },
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
 * DSS Penjurusan SMAN 26 (Murni Sesuai Catatan Dokumen BK):
 * - C = Bahasa
 * - RIA = IPA (MIPA)
 * - SEC = IPS
 */
export function matchRekomendasiJurusan(
  top1: RiasecCode,
  top2: RiasecCode,
  top3: RiasecCode
): JurusanDetail {
  // 1. Dominan C -> Bahasa
  if (top1 === 'C') {
    return REKOMENDASI_JURUSAN.BAHASA;
  }

  // Bobot peringkat: Top 1 = 3, Top 2 = 2, Top 3 = 1
  const weights: Record<RiasecCode, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  weights[top1] += 3;
  weights[top2] += 2;
  weights[top3] += 1;

  const poinRIA = weights.R + weights.I + weights.A; // RIA = IPA
  const poinSEC = weights.S + weights.E + weights.C; // SEC = IPS

  // 2. Evaluasi Klaster RIA vs SEC
  if (poinRIA > poinSEC) {
    return REKOMENDASI_JURUSAN.MIPA;
  }

  // 3. Masuk klaster SEC -> IPS
  return REKOMENDASI_JURUSAN.IPS;
}