"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Compass,
} from "lucide-react";
import { BkAssessmentRekap, BkScheduleItem } from "@/hooks/useBkDashboardData";
import { AlertCircle, RefreshCw } from "lucide-react";

interface BkAssessmentSummaryProps {
  rekapAssessment?: BkAssessmentRekap | null;
  assessmentStats?: {
    angketMasalahCount: number;
    angketMasalahPercent: number;
    gayaBelajarCount: number;
    gayaBelajarPercent: number;
    minatBakatCount: number;
    minatBakatPercent: number;
  };
  totalSiswa?: number;
  pendingReviewCount?: number;
  schedules: BkScheduleItem[];
  activeSchedulesCount: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BkAssessmentSummary({
  rekapAssessment,
  assessmentStats,
  totalSiswa: propTotalSiswa,
  pendingReviewCount: propPendingReviewCount,
  schedules,
  activeSchedulesCount,
  isLoading = false,
  error = null,
  onRetry,
}: BkAssessmentSummaryProps) {
  const totalSiswa = propTotalSiswa ?? rekapAssessment?.totalSiswa ?? 0;
  
  const vakCount = assessmentStats?.gayaBelajarCount ?? rekapAssessment?.statistik.totalMengisiVak ?? 0;
  const riasecCount = assessmentStats?.minatBakatCount ?? rekapAssessment?.statistik.totalMengisiRiasec ?? 0;
  const angketCount = assessmentStats?.angketMasalahCount ?? rekapAssessment?.statistik.totalMengisiAngket ?? 0;

  const vakPercent = assessmentStats?.gayaBelajarPercent ?? (totalSiswa > 0 ? Math.round((vakCount / totalSiswa) * 100) : 0);
  const riasecPercent = assessmentStats?.minatBakatPercent ?? (totalSiswa > 0 ? Math.round((riasecCount / totalSiswa) * 100) : 0);
  const angketPercent = assessmentStats?.angketMasalahPercent ?? (totalSiswa > 0 ? Math.round((angketCount / totalSiswa) * 100) : 0);

  // Total pengerjaan rata-rata
  const avgCompleted = Math.round((vakCount + riasecCount + angketCount) / 3);
  const avgRemaining = Math.max(0, totalSiswa - avgCompleted);

  // Cek jadwal per tipe
  const getScheduleMeta = (type: "ANGKET_MASALAH" | "GAYA_BELAJAR" | "MINAT_BAKAT") => {
    const s = schedules.find((item) => item.tipe === type && item.isActive);
    if (!s) return { label: "Belum dijadwalkan", isScheduled: false };
    const end = new Date(s.tanggalSelesai);
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(end);
    return {
      label: `Berlangsung · s.d. ${dateFormatted}`,
      isScheduled: true,
    };
  };

  const angketMeta = getScheduleMeta("ANGKET_MASALAH");
  const vakMeta = getScheduleMeta("GAYA_BELAJAR");
  const riasecMeta = getScheduleMeta("MINAT_BAKAT");

  const pendingReviewCount =
    propPendingReviewCount ??
    rekapAssessment?.siswa?.filter(
      (s) => s.angketMasalah?.sudah && s.angketMasalah?.statusReview === "PENDING"
    ).length ?? 0;

  return (
    <section
      aria-labelledby="assessment-summary-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4 shadow-xs transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER PANEL */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#107a55] dark:bg-[#0d332e] dark:text-[#34d399] sm:h-10 sm:w-10"
            aria-hidden="true"
          >
            <FileText size={19} className="sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h3
              id="assessment-summary-heading"
              className="text-base font-bold tracking-tight text-[#071a3a] dark:text-white sm:text-[17px]"
            >
              Ringkasan Asesmen
            </h3>
            <p className="text-xs font-medium text-[#5b6b85] dark:text-[#829dbf]">
              Progres pengerjaan siswa
            </p>
          </div>
        </div>

        {error && !isLoading ? (
          <div className="mt-4 flex h-[180px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/40 dark:bg-red-950/30">
            <AlertCircle size={22} className="text-red-500" />
            <p className="mt-2 text-[12.5px] font-bold text-red-800 dark:text-red-300">
              Gagal Memuat Ringkasan Asesmen
            </p>
            <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
              {error}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-[11.5px] font-bold text-white transition-colors hover:bg-red-700"
              >
                <RefreshCw size={12} />
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 3 STAT MINI BOXES */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-2.5">
          <div className="rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-2.5 text-center transition-colors dark:border-[#173456] dark:bg-[#071526] sm:p-3">
            {isLoading ? (
              <div className="mx-auto h-6 w-10 animate-pulse rounded bg-[#e6ebf3] dark:bg-[#163863]" />
            ) : (
              <span className="text-base font-extrabold tabular-nums text-[#071a3a] dark:text-white sm:text-lg">
                {activeSchedulesCount}
              </span>
            )}
            <p className="mt-0.5 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
              Jadwal aktif
            </p>
          </div>

          <div className="rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-2.5 text-center transition-colors dark:border-[#173456] dark:bg-[#071526] sm:p-3">
            {isLoading ? (
              <div className="mx-auto h-6 w-10 animate-pulse rounded bg-[#e6ebf3] dark:bg-[#163863]" />
            ) : (
              <span className="text-base font-extrabold tabular-nums text-[#107a55] dark:text-[#34d399] sm:text-lg">
                {avgCompleted}
              </span>
            )}
            <p className="mt-0.5 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
              Sudah selesai
            </p>
          </div>

          <div className="rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-2.5 text-center transition-colors dark:border-[#173456] dark:bg-[#071526] sm:p-3">
            {isLoading ? (
              <div className="mx-auto h-6 w-10 animate-pulse rounded bg-[#e6ebf3] dark:bg-[#163863]" />
            ) : (
              <span className="text-base font-extrabold tabular-nums text-[#5b6b85] dark:text-[#829dbf] sm:text-lg">
                {avgRemaining}
              </span>
            )}
            <p className="mt-0.5 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
              Belum selesai
            </p>
          </div>
        </div>

        {/* 3 BARIS ASESMEN */}
        <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
          {/* Angket Masalah */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-[13px]">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <FileText size={15} className="shrink-0 text-[#b85b08] dark:text-[#fcd34d]" aria-hidden="true" />
                <span className="truncate font-bold text-[#071a3a] dark:text-white">
                  Angket Masalah
                </span>
                <span className="hidden truncate text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:inline">
                  ({angketMeta.label})
                </span>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-[#071a3a] dark:text-white">
                {angketPercent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Capaian Angket Masalah"
              aria-valuenow={angketPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 w-full overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
            >
              <div
                className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                style={{ width: `${Math.max(angketPercent, 0)}%` }}
              />
            </div>
          </div>

          {/* Gaya Belajar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-[13px]">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <Sparkles size={15} className="shrink-0 text-[#107a55] dark:text-[#34d399]" aria-hidden="true" />
                <span className="truncate font-bold text-[#071a3a] dark:text-white">
                  Gaya Belajar
                </span>
                <span className="hidden truncate text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:inline">
                  ({vakMeta.label})
                </span>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-[#071a3a] dark:text-white">
                {vakPercent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Capaian Gaya Belajar"
              aria-valuenow={vakPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 w-full overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
            >
              <div
                className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                style={{ width: `${Math.max(vakPercent, 0)}%` }}
              />
            </div>
          </div>

          {/* Minat & Bakat */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-[13px]">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <Compass size={15} className="shrink-0 text-[#5b6b85] dark:text-[#829dbf]" aria-hidden="true" />
                <span className="truncate font-bold text-[#071a3a] dark:text-white">
                  Minat & Bakat
                </span>
                <span className="hidden truncate text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:inline">
                  ({riasecMeta.label})
                </span>
              </div>
              <span className="shrink-0 font-bold tabular-nums text-[#5b6b85] dark:text-[#829dbf]">
                {riasecMeta.isScheduled ? `${riasecPercent}%` : "—"}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Capaian Minat dan Bakat"
              aria-valuenow={riasecPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2.5 w-full overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
            >
              <div
                className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                style={{ width: `${riasecMeta.isScheduled ? riasecPercent : 0}%` }}
              />
            </div>
          </div>
        </div>
      </>
    )}
  </div>

      {/* FOOTER ACTIONS (Mobile: susun flex-wrap / vertikal aman, Desktop: 2 sisi) */}
      <div className="mt-4 flex flex-col gap-2.5 border-t border-[#f5f8fc] pt-3 dark:border-[#163863] sm:flex-row sm:items-center sm:justify-between sm:pt-3.5">
        <Link
          href="/bk/asesmen/angket-masalah"
          className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#eff6ff] px-3 py-1.5 text-xs font-semibold text-[#1d4ed8] transition-colors hover:bg-[#dbeafe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:bg-[#143356] dark:text-[#8fb4dc] dark:hover:bg-[#1a416d]"
        >
          <span className="tabular-nums">{pendingReviewCount}</span>
          <span className="ml-1">hasil menunggu review</span>
        </Link>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Link
            href="/bk/jadwal-asesmen"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#e6ebf3] bg-white px-3.5 py-2 text-xs font-semibold text-[#071a3a] transition-colors hover:bg-[#f5f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:border-[#1a385c] dark:bg-[#0e2137] dark:text-white dark:hover:bg-[#143152]"
          >
            Kelola jadwal
          </Link>
          <Link
            href="/bk/rekap"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0b2552] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#071a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:bg-[#f4c542] dark:text-[#071526] dark:hover:bg-[#e5b632]"
          >
            Buka rekap
          </Link>
        </div>
      </div>
    </section>
  );
}
