/**
 * Master Konstanta Pelanggaran & DSS Disiplin Kumulatif
 * Sesuai PRD Bagian 3.6 & 4
 */

export const THRESHOLD_PELANGGARAN = {
  SP_1: 50,
  PANGGILAN_ORTU: 75,
  DROP_OUT: 100,
} as const;

export const STATUS_KEDISIPLINAN = {
  AMAN: "AMAN",
  SP_1: "SP_1",
  PANGGILAN_ORTU: "PANGGILAN_ORTU",
  DROP_OUT: "DROP_OUT",
} as const;

export type StatusKedisiplinan =
  (typeof STATUS_KEDISIPLINAN)[keyof typeof STATUS_KEDISIPLINAN];

export const STATUS_DISIPLIN_META: Record<
  StatusKedisiplinan,
  {
    label: string;
    minPoin: number;
    maxPoin: number | null;
    badgeVariant: "success" | "warning" | "orange" | "danger";
    deskripsi: string;
    tindakan: string;
  }
> = {
  AMAN: {
    label: "Tertib / Aman",
    minPoin: 0,
    maxPoin: 49,
    badgeVariant: "success",
    deskripsi: "Kondisi kedisiplinan baik, tidak ada akumulasi poin yang membahayakan.",
    tindakan: "Pembinaan rutin berkala di kelas oleh Wali Kelas dan Guru BK.",
  },
  SP_1: {
    label: "Surat Peringatan 1 (SP-1)",
    minPoin: 50,
    maxPoin: 74,
    badgeVariant: "warning",
    deskripsi: "Akumulasi poin mencapai batas peringatan pertama (50 - 74 poin).",
    tindakan: "Penerbitan Surat Peringatan 1 (SP-1) resmi dan pelaksanaan konseling individual intensif.",
  },
  PANGGILAN_ORTU: {
    label: "Panggilan Orang Tua",
    minPoin: 75,
    maxPoin: 99,
    badgeVariant: "orange",
    deskripsi: "Akumulasi poin kedisiplinan mengkhawatirkan (75 - 99 poin).",
    tindakan: "Penerbitan Surat Panggilan Resmi Orang Tua/Wali murid ke sekolah untuk konferensi kasus kedisiplinan bersama Kepala Sekolah dan Guru BK.",
  },
  DROP_OUT: {
    label: "Ambang Kritis / Rekomendasi Drop Out (DO)",
    minPoin: 100,
    maxPoin: null,
    badgeVariant: "danger",
    deskripsi: "Ambang batas kritis tercapai (>= 100 poin).",
    tindakan: "Rekomendasi Sidang Pleno Dewan Guru untuk pengembalian pembinaan siswa secara penuh kepada orang tua (Drop Out).",
  },
};

/**
 * Referensi contoh pelanggaran tata tertib sekolah untuk panduan input poin Guru BK
 */
export const REFERENSI_JENIS_PELANGGARAN = [] as const;