"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Info, ArrowRight } from "lucide-react";
import { BkViolationStudentItem } from "@/hooks/useBkDashboardData";
import { AlertCircle, RefreshCw } from "lucide-react";

interface BkViolationSummaryProps {
  violationStudents: BkViolationStudentItem[];
  totalRecords: number;
  criticalCount: number;
  violationCategories?: {
    kedisiplinan: number;
    tataTertib: number;
    lainnya: number;
  };
  followUpBreakdown?: {
    belumDitangani: number;
    dalamPembinaan: number;
    selesai: number;
    dibatalkan: number;
  };
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BkViolationSummary({
  violationStudents,
  totalRecords,
  criticalCount,
  violationCategories,
  followUpBreakdown,
  isLoading = false,
  error = null,
  onRetry,
}: BkViolationSummaryProps) {
  // Jumlah siswa yang memiliki akumulasi poin pelanggaran > 0
  const siswaTercatat = violationStudents.length;

  // Gunakan kategori aktual dari backend jika tersedia, atau hitung dari riwayat siswa
  let kedisiplinanCount = violationCategories?.kedisiplinan ?? 0;
  let tataTertibCount = violationCategories?.tataTertib ?? 0;
  let lainnyaCount = violationCategories?.lainnya ?? 0;

  if (!violationCategories && violationStudents.length > 0) {
    for (const s of violationStudents) {
      for (const r of s.riwayatTerbaru) {
        const text = (r.jenis || "").toLowerCase();
        if (text.includes("disiplin") || text.includes("bolos") || text.includes("terlambat")) {
          kedisiplinanCount++;
        } else if (text.includes("seragam") || text.includes("atribut") || text.includes("rambut") || text.includes("kelas")) {
          tataTertibCount++;
        } else {
          lainnyaCount++;
        }
      }
    }
  }

  const maxCategory = Math.max(kedisiplinanCount, tataTertibCount, lainnyaCount, 1);
  const hasNoViolations = totalRecords === 0 && kedisiplinanCount === 0 && tataTertibCount === 0 && lainnyaCount === 0;

  return (
    <section
      aria-labelledby="violation-summary-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4 shadow-sm transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER PANEL & PERIOD FILTER BUTTONS */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#b85b08] dark:bg-amber-950/70 dark:text-amber-400"
              aria-hidden="true"
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3
                id="violation-summary-heading"
                className="text-[15px] font-bold text-[#071a3a] dark:text-white sm:text-[16px]"
              >
                Monitoring Pelanggaran
              </h3>
              <p className="text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
                Catatan pelanggaran per periode
              </p>
            </div>
          </div>

          {/* Baseline Indicator */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] px-3 py-1.5 text-[12px] font-semibold text-[#071a3a] dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf]">
            <span className="h-2 w-2 rounded-full bg-[#f4c542]" aria-hidden="true" />
            <span>Semua Data Tercatat</span>
          </div>
        </div>

        {error && !isLoading ? (
          <div className="mt-4 flex h-[180px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/40 dark:bg-red-950/30">
            <AlertCircle size={22} className="text-red-500" />
            <p className="mt-2 text-[12.5px] font-bold text-red-800 dark:text-red-300">
              Gagal Memuat Monitoring Pelanggaran
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
              <div className="mx-auto my-1 h-6 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <span className="text-[18px] font-extrabold tabular-nums text-[#071a3a] dark:text-white sm:text-[20px]">
                {totalRecords}
              </span>
            )}
            <p className="mt-0.5 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
              Total Catatan
            </p>
          </div>

          <div className="rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-2.5 text-center transition-colors dark:border-[#173456] dark:bg-[#071526] sm:p-3" title="Jumlah siswa yang memiliki catatan akumulasi poin pelanggaran">
            {isLoading ? (
              <div className="mx-auto my-1 h-6 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <span className="text-[18px] font-extrabold tabular-nums text-[#107a55] dark:text-[#34d399] sm:text-[20px]">
                {siswaTercatat}
              </span>
            )}
            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
              Siswa Tercatat
            </p>
          </div>

          <div className="rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-2.5 text-center transition-colors dark:border-[#173456] dark:bg-[#071526] sm:p-3" title="Jumlah siswa dengan akumulasi poin >= 25 (Ambang sanksi resmi Pasal 8)">
            {isLoading ? (
              <div className="mx-auto my-1 h-6 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ) : (
              <span className="text-[18px] font-extrabold tabular-nums text-[#b85b08] dark:text-amber-400 sm:text-[20px]">
                {criticalCount}
              </span>
            )}
            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
              Perlu tindak lanjut
            </p>
          </div>
        </div>

        {/* STATUS TINDAK LANJUT PEMBINAAN KASUS (DATA AKTUAL DATABASE) */}
        {followUpBreakdown && (
          <div className="mt-4 rounded-xl border border-[#e6ebf3] bg-[#f8fafc] p-3 dark:border-[#173456] dark:bg-[#071526]/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11.5px] font-bold text-[#071a3a] dark:text-white">
                Status Tindak Lanjut Kasus
              </span>
              <span className="text-[10.5px] text-[#5b6b85] dark:text-[#829dbf]">
                Total: {totalRecords} kasus
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="rounded-lg bg-amber-50 p-1.5 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[13px] font-extrabold text-amber-800 dark:text-amber-300">
                  {isLoading ? "-" : followUpBreakdown.belumDitangani}
                </span>
                <p className="text-[9.5px] font-medium text-amber-700 dark:text-amber-400 line-clamp-1">
                  Belum Ditangani
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[13px] font-extrabold text-blue-800 dark:text-blue-300">
                  {isLoading ? "-" : followUpBreakdown.dalamPembinaan}
                </span>
                <p className="text-[9.5px] font-medium text-blue-700 dark:text-blue-400 line-clamp-1">
                  Pembinaan
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-1.5 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[13px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  {isLoading ? "-" : followUpBreakdown.selesai}
                </span>
                <p className="text-[9.5px] font-medium text-emerald-700 dark:text-emerald-400 line-clamp-1">
                  Selesai
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 p-1.5 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300">
                  {isLoading ? "-" : followUpBreakdown.dibatalkan}
                </span>
                <p className="text-[9.5px] font-medium text-slate-600 dark:text-slate-400 line-clamp-1">
                  Dibatalkan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DISTRIBUSI KATEGORI */}
        <div className="mt-4 space-y-3 sm:mt-5">
          <p className="text-[12px] font-bold text-[#071a3a] dark:text-white sm:text-[13px]">
            Distribusi kategori
          </p>

          {hasNoViolations && !isLoading ? (
            <div className="rounded-xl border border-dashed border-[#e6ebf3] p-4 text-center dark:border-[#173456]">
              <p className="text-[12px] text-[#5b6b85] dark:text-[#829dbf]">
                Tidak ada catatan pelanggaran pada periode ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Kategori 1: Kedisiplinan */}
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                <span className="w-24 shrink-0 truncate text-[#5b6b85] dark:text-[#829dbf] sm:w-28">
                  Kedisiplinan
                </span>
                <div
                  role="progressbar"
                  aria-label="Pelanggaran kedisiplinan"
                  aria-valuenow={kedisiplinanCount}
                  aria-valuemin={0}
                  aria-valuemax={maxCategory}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
                >
                  <div
                    className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                    style={{ width: `${Math.round((kedisiplinanCount / maxCategory) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-bold tabular-nums text-[#071a3a] dark:text-white">
                  {isLoading ? "-" : kedisiplinanCount}
                </span>
              </div>

              {/* Kategori 2: Tata tertib kelas */}
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                <span className="w-24 shrink-0 truncate text-[#5b6b85] dark:text-[#829dbf] sm:w-28">
                  Tata tertib
                </span>
                <div
                  role="progressbar"
                  aria-label="Pelanggaran tata tertib"
                  aria-valuenow={tataTertibCount}
                  aria-valuemin={0}
                  aria-valuemax={maxCategory}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
                >
                  <div
                    className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                    style={{ width: `${Math.round((tataTertibCount / maxCategory) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-bold tabular-nums text-[#071a3a] dark:text-white">
                  {isLoading ? "-" : tataTertibCount}
                </span>
              </div>

              {/* Kategori 3: Lainnya */}
              <div className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                <span className="w-24 shrink-0 truncate text-[#5b6b85] dark:text-[#829dbf] sm:w-28">
                  Lainnya
                </span>
                <div
                  role="progressbar"
                  aria-label="Pelanggaran lainnya"
                  aria-valuenow={lainnyaCount}
                  aria-valuemin={0}
                  aria-valuemax={maxCategory}
                  className="h-2 flex-1 overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
                >
                  <div
                    className="h-full rounded-full bg-[#071a3a] transition-all duration-500 dark:bg-[#f4c542]"
                    style={{ width: `${Math.round((lainnyaCount / maxCategory) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-bold tabular-nums text-[#071a3a] dark:text-white">
                  {isLoading ? "-" : lainnyaCount}
                </span>
              </div>
            </div>
          )}
        </div>
        </>
      )}

        {/* CALLOUT PANDUAN NETRAL */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-3 text-[11px] text-[#5b6b85] transition-colors dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf] sm:mt-5 sm:text-[11.5px]">
          <Info size={16} className="mt-0.5 shrink-0 text-[#5b6b85] dark:text-[#829dbf]" aria-hidden="true" />
          <p className="leading-relaxed">
            Poin hanya salah satu indikator. Selalu dibaca bersama riwayat konseling dan konteks pribadi siswa.
          </p>
        </div>
      </div>

      {/* FOOTER LINK (Touch target min-h-[44px]) */}
      <div className="mt-5 border-t border-[#f5f8fc] pt-3 dark:border-[#163863]">
        <Link
          href="/bk/pelanggaran"
          className="group flex min-h-[44px] w-full items-center justify-between rounded-lg px-1 text-[12.5px] font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:text-[#f4c542] dark:hover:text-[#ffd66b] sm:w-auto sm:justify-start sm:gap-2"
        >
          <span>Buka Pelanggaran & Poin</span>
          <ArrowRight
            size={14}
            aria-hidden="true"
            className="transition-transform duration-150 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
