export interface ButirMasalah {
  id: number;
  kategori: string;
  subbab: string;
  deskripsi: string;
}

export const STATUS_REVIEW_DIAGNOSTIK = {
  PENDING: "PENDING",
  DIREVIEW: "DIREVIEW",
} as const;

export type StatusReviewDiagnostik =
  (typeof STATUS_REVIEW_DIAGNOSTIK)[keyof typeof STATUS_REVIEW_DIAGNOSTIK];

export const DAFTAR_MASALAH_DIAGNOSTIK: ButirMasalah[] = [
  // Kategori: Belajar
  {
    id: 1,
    kategori: "Belajar",
    subbab: "Manajemen Waktu",
    deskripsi: "Sering menunda pengerjaan tugas sekolah hingga menumpuk di akhir waktu",
  },
  {
    id: 2,
    kategori: "Belajar",
    subbab: "Manajemen Waktu",
    deskripsi: "Sulit membagi waktu antara belajar, istirahat, dan menggunakan gadget/media sosial",
  },
  {
    id: 3,
    kategori: "Belajar",
    subbab: "Konsentrasi & Motivasi",
    deskripsi: "Mudah mengantuk, jenuh, atau hilang fokus saat guru menjelaskan materi di kelas",
  },
  {
    id: 4,
    kategori: "Belajar",
    subbab: "Konsentrasi & Motivasi",
    deskripsi: "Kurang bersemangat atau merasa kehilangan motivasi dalam mengejar target akademik",
  },
  {
    id: 5,
    kategori: "Belajar",
    subbab: "Strategi Belajar",
    deskripsi: "Kesulitan memahami mata pelajaran yang membutuhkan perhitungan atau konsep abstrak",
  },
  {
    id: 6,
    kategori: "Belajar",
    subbab: "Strategi Belajar",
    deskripsi: "Belum menemukan metode belajar mandiri yang efektif dan menyenangkan bagi diri sendiri",
  },

  // Kategori: Pribadi
  {
    id: 7,
    kategori: "Pribadi",
    subbab: "Pengelolaan Emosi",
    deskripsi: "Mudah panik, cemas berlebihan, atau tegang saat menghadapi ujian dan evaluasi",
  },
  {
    id: 8,
    kategori: "Pribadi",
    subbab: "Pengelolaan Emosi",
    deskripsi: "Sering merasa sedih, mudah tersinggung, atau kesulitan mengontrol amarah",
  },
  {
    id: 9,
    kategori: "Pribadi",
    subbab: "Kesehatan & Pola Hidup",
    deskripsi: "Sering tidur larut malam (begadang) sehingga badan lemas dan kurang konsentrasi di sekolah",
  },
  {
    id: 10,
    kategori: "Pribadi",
    subbab: "Kesehatan & Pola Hidup",
    deskripsi: "Pola makan tidak teratur atau sering merasa kelelahan fisik tanpa alasan medis yang jelas",
  },
  {
    id: 11,
    kategori: "Pribadi",
    subbab: "Kepercayaan Diri",
    deskripsi: "Merasa minder dan kurang percaya diri terhadap kemampuan diri dibanding teman sekelas",
  },
  {
    id: 12,
    kategori: "Pribadi",
    subbab: "Kepercayaan Diri",
    deskripsi: "Takut melakukan kesalahan dan selalu ragu saat harus mengambil inisiatif atau keputusan",
  },

  // Kategori: Sosial
  {
    id: 13,
    kategori: "Sosial",
    subbab: "Hubungan Teman Sebaya",
    deskripsi: "Merasa canggung berbaur, sulit mencari teman akrab, atau merasa diasingkan lingkungan",
  },
  {
    id: 14,
    kategori: "Sosial",
    subbab: "Hubungan Teman Sebaya",
    deskripsi: "Pernah mengalami konflik atau kesalahpahaman dengan teman sekolah yang belum tuntas",
  },
  {
    id: 15,
    kategori: "Sosial",
    subbab: "Komunikasi Interpersonal",
    deskripsi: "Gugup dan sulit mengungkapkan gagasan saat berbicara di depan umum atau forum kelas",
  },
  {
    id: 16,
    kategori: "Sosial",
    subbab: "Komunikasi Interpersonal",
    deskripsi: "Sulit menolak ajakan teman (peer pressure) meski sadar tindakan tersebut merugikan",
  },
  {
    id: 17,
    kategori: "Sosial",
    subbab: "Hubungan Keluarga",
    deskripsi: "Merasa kurang didengar atau sering berselisih paham dengan orang tua/keluarga di rumah",
  },

  // Kategori: Karier
  {
    id: 18,
    kategori: "Karier",
    subbab: "Eksplorasi Minat & Bakat",
    deskripsi: "Belum memahami dengan jelas bakat, minat, serta kelebihan utama yang dimiliki",
  },
  {
    id: 19,
    kategori: "Karier",
    subbab: "Eksplorasi Minat & Bakat",
    deskripsi: "Bingung memilih kegiatan ekstrakurikuler atau bidang keterampilan yang ingin ditekuni",
  },
  {
    id: 20,
    kategori: "Karier",
    subbab: "Rencana Masa Depan",
    deskripsi: "Belum memiliki gambaran tujuan karier atau rencana konkret setelah lulus sekolah",
  },
  {
    id: 21,
    kategori: "Karier",
    subbab: "Rencana Masa Depan",
    deskripsi: "Kurang memiliki informasi seputar dunia perkuliahan, pelatihan vokasi, atau peluang kerja",
  },
];