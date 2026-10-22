import React from "react";
import { BookOpen, MessageSquare, Compass, Users, Sparkles } from "lucide-react";
import { STATUS_KONSELING, StatusKonseling } from "@/constants/konseling.constant";

export interface KonselingItem {
  id: number;
  siswaId: number;
  siswa?: {
    id: number;
    nisn: string;
    nama: string | null;
    rombel: string | null;
  } | null;
  counselor?: {
    id: number;
    nip: string | null;
    nama: string;
  } | null;
  tanggal: string; // "YYYY-MM-DD"
  jam: string;
  topik: string;
  keluhan: string | null;
  status: StatusKonseling | string;
  statusLabel: string;
  badgeVariant: "pending" | "info" | "danger" | "success";
  catatanGuruBK: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const TOPIK_OPTIONS: {
  value: string;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}[] = [
  { value: "Belajar", label: "Belajar", emoji: "📚", icon: BookOpen },
  { value: "Pribadi", label: "Pribadi", emoji: "💬", icon: MessageSquare },
  { value: "Karier", label: "Karier", emoji: "🧭", icon: Compass },
  { value: "Sosial", label: "Sosial", emoji: "🤝", icon: Users },
  { value: "Lainnya", label: "Lainnya", emoji: "✨", icon: Sparkles },
];

export function getTopikMeta(topikName: string) {
  const match = TOPIK_OPTIONS.find(
    (t) => t.value.toLowerCase() === topikName.trim().toLowerCase()
  );
  if (match) return match;
  return {
    value: topikName,
    label: topikName,
    emoji: "💬",
    icon: MessageSquare,
  };
}

export function formatIndonesianDate(
  dateInput: string | Date | null | undefined,
  includeWeekday = true
): string {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat("id-ID", {
      ...(includeWeekday ? { weekday: "long" } : {}),
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function getStatusDisplay(session: {
  status: string;
  catatanGuruBK?: string | null;
}) {
  switch (session.status) {
    case STATUS_KONSELING.PENDING:
      return {
        label: "Menunggu Persetujuan",
        shortLabel: "Menunggu",
        badgeClass:
          "bg-[#fef3c7] text-[#92400e] border border-[#fde68a] dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
        dotColor: "bg-amber-500",
      };
    case STATUS_KONSELING.DISETUJUI:
      return {
        label: "Disetujui",
        shortLabel: "Disetujui",
        badgeClass:
          "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
        dotColor: "bg-blue-500",
      };
    case STATUS_KONSELING.DITOLAK:
      const isCancelledByStudent =
        session.catatanGuruBK?.trim().toLowerCase() === "dibatalkan oleh siswa";
      return {
        label: isCancelledByStudent ? "Dibatalkan" : "Ditolak",
        shortLabel: "Ditolak",
        badgeClass:
          "bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] dark:bg-red-950/70 dark:text-red-300 dark:border-red-800",
        dotColor: "bg-red-500",
        isCancelledByStudent,
      };
    case STATUS_KONSELING.SELESAI:
      return {
        label: "Selesai",
        shortLabel: "Selesai",
        badgeClass:
          "bg-[#d1fae5] text-[#047857] border border-[#a7f3d0] dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
        dotColor: "bg-emerald-500",
      };
    default:
      return {
        label: session.status,
        shortLabel: session.status,
        badgeClass:
          "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300",
        dotColor: "bg-slate-400",
      };
  }
}
