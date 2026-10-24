"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useBkDashboardData } from "@/hooks/useBkDashboardData";
import { BkWelcomeHero } from "@/components/bk/dashboard/BkWelcomeHero";
import { BkStatCards } from "@/components/bk/dashboard/BkStatCards";
import { BkViolationTrendChart } from "@/components/bk/dashboard/BkViolationTrendChart";
import { BkCounselingDonutChart } from "@/components/bk/dashboard/BkCounselingDonutChart";
import { BkAttentionPanel } from "@/components/bk/dashboard/BkAttentionPanel";
import { BkCounselingSummary } from "@/components/bk/dashboard/BkCounselingSummary";
import { BkAssessmentSummary } from "@/components/bk/dashboard/BkAssessmentSummary";
import { BkViolationSummary } from "@/components/bk/dashboard/BkViolationSummary";
import { BkDssPriorityPanel } from "@/components/bk/dashboard/BkDssPriorityPanel";

export default function BkDashboardPage() {
  const {
    totalSiswa,
    konselingPendingCount,
    konselingApprovedCount,
    konselingCompletedCount,
    konselingRejectedCount,
    konselingList,
    schedules,
    activeSchedulesCount,
    violationStudents,
    criticalStudentsCount,
    totalViolationRecords,
    violationMonthlyTrend,
    trendPeriodLabel,
    trendTotalCases,
    trendAveragePerMonth,
    trendMonthDiff,
    assessmentStats,
    violationCategories,
    followUpBreakdown,
    pendingAngketReviewCount,
    isLoading,
    error,
    errors,
    refresh,
  } = useBkDashboardData();

  // Hitung total atensi aktif hari ini
  const totalAttentionCount =
    konselingPendingCount + pendingAngketReviewCount + Math.min(criticalStudentsCount, 3);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8 space-y-4 sm:space-y-6 lg:space-y-7">
      {/* TAMPILAN ERROR DENGAN TOMBOL COBA LAGI */}
      {error && (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 transition-colors dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 sm:flex-row sm:items-center"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-[13px] font-semibold">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:min-h-[36px] sm:px-3.5 sm:py-1.5"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* 1. WELCOME BANNER (Hero dengan tanggal dan perhatian hari ini) */}
      <section aria-label="Sambutan Dashboard">
        <BkWelcomeHero attentionCount={totalAttentionCount} />
      </section>

      {/* 2. EMPAT KARTU STATISTIK UTAMA */}
      <section aria-label="Statistik Utama">
        <BkStatCards
          totalSiswa={totalSiswa}
          konselingPendingCount={konselingPendingCount}
          activeSchedulesCount={activeSchedulesCount}
          criticalStudentsCount={criticalStudentsCount}
          isLoading={isLoading}
        />
      </section>

      {/* 3. ROW 1: TREN PELANGGARAN SISWA (7-COL) & STATUS KONSELING (5-COL) */}
      <section aria-label="Grafik Analisis Tren & Konseling">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Kolom Kiri: Tren Pelanggaran Siswa 6 Bulan Terakhir */}
          <div className="flex flex-col lg:col-span-7">
            <BkViolationTrendChart
              monthlyData={violationMonthlyTrend}
              periodLabel={trendPeriodLabel}
              totalCases={trendTotalCases}
              averagePerMonth={trendAveragePerMonth}
              monthDiff={trendMonthDiff}
              isLoading={isLoading}
              error={errors.stats}
              onRetry={() => refresh()}
            />
          </div>

          {/* Kolom Kanan: Status Konseling (Donut Chart) */}
          <div className="flex flex-col lg:col-span-5">
            <BkCounselingDonutChart
              pendingCount={konselingPendingCount}
              approvedCount={konselingApprovedCount}
              completedCount={konselingCompletedCount}
              rejectedCount={konselingRejectedCount}
              isLoading={isLoading}
              error={errors.stats}
              onRetry={() => refresh()}
            />
          </div>
        </div>
      </section>

      {/* 4. ROW 2: PANEL PERLU PERHATIAN (12-COL DENGAN 3 SUB-KARTU) */}
      <section aria-label="Perlu Perhatian Mendesak">
        <BkAttentionPanel
          konselingList={konselingList}
          schedules={schedules}
          pendingAngketReviewCount={pendingAngketReviewCount}
          violationStudents={violationStudents}
          isLoading={isLoading}
          error={errors.konselingList || errors.schedules || errors.violationStudents}
          onRetry={() => refresh()}
        />
      </section>

      {/* 5. ROW 3: RINGKASAN KONSELING (6-COL) & RINGKASAN ASESMEN (6-COL) */}
      <section aria-label="Ringkasan Operasional Konseling dan Asesmen">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Kolom Kiri: Ringkasan Konseling */}
          <div className="flex flex-col lg:col-span-6">
            <BkCounselingSummary
              pendingCount={konselingPendingCount}
              approvedCount={konselingApprovedCount}
              completedCount={konselingCompletedCount}
              rejectedCount={konselingRejectedCount}
              isLoading={isLoading}
              error={errors.stats}
              onRetry={() => refresh()}
            />
          </div>

          {/* Kolom Kanan: Ringkasan Asesmen */}
          <div className="flex flex-col lg:col-span-6">
            <BkAssessmentSummary
              assessmentStats={assessmentStats}
              totalSiswa={totalSiswa}
              pendingReviewCount={pendingAngketReviewCount}
              schedules={schedules}
              activeSchedulesCount={activeSchedulesCount}
              isLoading={isLoading}
              error={errors.stats || errors.schedules}
              onRetry={() => refresh()}
            />
          </div>
        </div>
      </section>

      {/* 6. ROW 4: MONITORING PELANGGARAN (6-COL) & REKAP DSS (6-COL) */}
      <section aria-label="Monitoring Pelanggaran dan Rekap DSS">
        <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Kolom Kiri: Monitoring Pelanggaran */}
          <div className="flex flex-col lg:col-span-6">
            <BkViolationSummary
              violationStudents={violationStudents}
              totalRecords={totalViolationRecords}
              criticalCount={criticalStudentsCount}
              violationCategories={violationCategories}
              followUpBreakdown={followUpBreakdown}
              isLoading={isLoading}
              error={errors.stats}
              onRetry={() => refresh()}
            />
          </div>

          {/* Kolom Kanan: Rekap & DSS (Prioritas Sanksi Resmi Tata Tertib SMAN 26) */}
          <div className="flex flex-col lg:col-span-6">
            <BkDssPriorityPanel
              violationStudents={violationStudents}
              criticalStudentsCount={criticalStudentsCount}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      {/* 7. FOOTER DISCLAIMER RESMI */}
      <footer className="pt-2 text-center">
        <p className="text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
          © {new Date().getFullYear()} Sistem Informasi Bimbingan dan Konseling (SI-BK) SMAN 26 Kabupaten Tangerang. Seluruh data operasional disinkronkan secara langsung dari database backend.
        </p>
      </footer>
    </div>
  );
}
