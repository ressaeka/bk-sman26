export const STATUS_KONSELING = {
  PENDING: "PENDING",
  DISETUJUI: "DISETUJUI",
  DITOLAK: "DITOLAK",
  SELESAI: "SELESAI",
} as const;

export type StatusKonseling = (typeof STATUS_KONSELING)[keyof typeof STATUS_KONSELING];

export const TOPIK_KONSELING = [
  "Belajar",
  "Pribadi",
  "Karier",
  "Sosial",
  "Lainnya",
] as const;

export type TopikKonseling = (typeof TOPIK_KONSELING)[number];

export const STATUS_KONSELING_META: Record<
  StatusKonseling,
  { label: string; badgeVariant: "pending" | "success" | "danger" | "info" }
> = {
  PENDING: {
    label: "Menunggu Persetujuan",
    badgeVariant: "pending",
  },
  DISETUJUI: {
    label: "Disetujui",
    badgeVariant: "info",
  },
  DITOLAK: {
    label: "Ditolak",
    badgeVariant: "danger",
  },
  SELESAI: {
    label: "Selesai",
    badgeVariant: "success",
  },
};