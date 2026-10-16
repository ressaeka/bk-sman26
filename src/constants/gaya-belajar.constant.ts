export const GAYA_BELAJAR_MODES = {
  VISUAL: "VISUAL",
  AUDITORI: "AUDITORI",
  KINESTETIK: "KINESTETIK",
} as const;

export type GayaBelajarMode = (typeof GAYA_BELAJAR_MODES)[keyof typeof GAYA_BELAJAR_MODES];

export interface SoalVAK {
  id: number;
  soal: string;
  opsi: {
    pilihan: "A" | "B" | "C";
    tipe: GayaBelajarMode;
    teks: string;
  }[];
}

// Dikosongkan terlebih dahulu, siap diisi butir resmi nanti
export const BANK_SOAL_VAK: SoalVAK[] = [
  // Contoh format butir (bisa dikosongkan jadi `export const BANK_SOAL_VAK: SoalVAK[] = [];`):
  {
    id: 1,
    soal: "Contoh butir pertanyaan VAK...",
    opsi: [
      { pilihan: "A", tipe: "VISUAL", teks: "Pilihan A (Visual)" },
      { pilihan: "B", tipe: "AUDITORI", teks: "Pilihan B (Auditori)" },
      { pilihan: "C", tipe: "KINESTETIK", teks: "Pilihan C (Kinestetik)" },
    ],
  },
];

export const GAYA_BELAJAR_DETAILS: Record<
  GayaBelajarMode,
  { nama: string; deskripsi: string; tipsBelajar: string[] }
> = {
  VISUAL: {
    nama: "Gaya Belajar Visual",
    deskripsi: "Optimal belajar melalui indra penglihatan, representasi gambar, dan diagram.",
    tipsBelajar: ["Gunakan mind-mapping", "Tandai catatan dengan stabilo/warna"],
  },
  AUDITORI: {
    nama: "Gaya Belajar Auditori",
    deskripsi: "Optimal belajar melalui indra pendengaran, penjelasan lisan, dan diskusi.",
    tipsBelajar: ["Dengarkan rekaman materi", "Belajar melalui diskusi atau kelompok"],
  },
  KINESTETIK: {
    nama: "Gaya Belajar Kinestetik",
    deskripsi: "Optimal belajar melalui praktik langsung, simulasi fisik, dan gerakan aktif.",
    tipsBelajar: ["Gunakan alat peraga nyata", "Belajar dengan metode praktik langsung"],
  },
};