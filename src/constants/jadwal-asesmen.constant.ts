export const TIPE_ASESMEN = {
  ANGKET_MASALAH: "ANGKET_MASALAH",
  GAYA_BELAJAR: "GAYA_BELAJAR",
  MINAT_BAKAT: "MINAT_BAKAT",
} as const;

export type TipeAsesmen = (typeof TIPE_ASESMEN)[keyof typeof TIPE_ASESMEN];

export const STATUS_AKSES_JADWAL = {
  MENUNGGU_JADWAL: "MENUNGGU_JADWAL",
  TERJADWAL: "TERJADWAL",
  SEDANG_BERLANGSUNG: "SEDANG_BERLANGSUNG",
  JADWAL_BERAKHIR: "JADWAL_BERAKHIR",
  SUDAH_SELESAI: "SUDAH_SELESAI",
} as const;

export type StatusAksesJadwal = (typeof STATUS_AKSES_JADWAL)[keyof typeof STATUS_AKSES_JADWAL];

export const LABEL_ASESMEN: Record<TipeAsesmen, string> = {
  ANGKET_MASALAH: "Angket Masalah Siswa",
  GAYA_BELAJAR: "Asesmen Gaya Belajar",
  MINAT_BAKAT: "Asesmen Minat & Bakat",
};

export const DESKRIPSI_ASESMEN: Record<TipeAsesmen, string> = {
  ANGKET_MASALAH: "Identifikasi kendala pribadi, sosial, belajar, dan karir untuk pendampingan Guru BK.",
  GAYA_BELAJAR: "Kenali kecenderungan gaya belajarmu: Visual, Auditori, atau Kinestetik.",
  MINAT_BAKAT: "Pemetaan potensi minat karir dan rekomendasi penjurusan kelas lanjutan.",
};

export const URL_ASESMEN: Record<TipeAsesmen, string> = {
  ANGKET_MASALAH: "/siswa/asesmen/angket-masalah",
  GAYA_BELAJAR: "/siswa/asesmen/gaya-belajar",
  MINAT_BAKAT: "/siswa/asesmen/minat-bakat",
};
