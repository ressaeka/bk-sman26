"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Lock, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

interface BkCounselingSummaryProps {
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  rejectedCount: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BkCounselingSummary({
  pendingCount,
  approvedCount,
  completedCount,
  rejectedCount,
  isLoading = false,
  error = null,
  onRetry,
}: BkCounselingSummaryProps) {
  const total = pendingCount + approvedCount + completedCount + rejectedCount;

  const statuses = [
    {
      label: "Menunggu",
      count: pendingCount,
      color: "bg-[#f4c542] dark:bg-[#fcd34d]",
    },
    {
      label: "Disetujui",
      count: approvedCount,
      color: "bg-[#071a3a] dark:bg-[#38bdf8]",
    },
    {
      label: "Selesai",
      count: completedCount,
      color: "bg-[#107a55] dark:bg-[#34d399]",
    },
    {
      label: "Ditolak",
      count: rejectedCount,
      color: "bg-[#94a3b8] dark:bg-[#64748b]",
    },
  ];

  return (
    <section
      aria-labelledby="counseling-summary-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4 shadow-xs transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER PANEL */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f8fc] text-[#071a3a] dark:bg-[#10243d] dark:text-white sm:h-10 sm:w-10"
            aria-hidden="true"
          >
            <MessageSquare size={19} className="sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <h3
              id="counseling-summary-heading"
              className="text-base font-bold tracking-tight text-[#071a3a] dark:text-white sm:text-[17px]"
            >
              Ringkasan Konseling
            </h3>
            <p className="text-xs font-medium text-[#5b6b85] dark:text-[#829dbf]">
              Status pengajuan operasional berjalan
            </p>
          </div>
        </div>

        {/* STATUS PROGRESS BARS */}
        <div className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-[#e6ebf3] dark:bg-[#163863]" />
                  <div className="h-3.5 w-6 animate-pulse rounded bg-[#e6ebf3] dark:bg-[#163863]" />
                </div>
                <div className="h-2.5 w-full animate-pulse rounded-full bg-[#f5f8fc] dark:bg-[#071526]" />
              </div>
            ))
          ) : error ? (
            <div className="flex h-[140px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/40 dark:bg-red-950/30">
              <AlertCircle size={22} className="text-red-500" />
              <p className="mt-2 text-[12.5px] font-bold text-red-800 dark:text-red-300">
                Gagal Memuat Ringkasan Konseling
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
          ) : total === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e6ebf3] p-4 text-center dark:border-[#173456]">
              <p className="text-xs font-medium text-[#5b6b85] dark:text-[#829dbf]">
                Belum ada data pengajuan konseling pada periode ini.
              </p>
            </div>
          ) : (
            statuses.map((item, idx) => {
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-[13px]">
                    <span className="font-semibold text-[#071a3a] dark:text-white">
                      {item.label}
                    </span>
                    <span className="font-bold tabular-nums text-[#071a3a] dark:text-white">
                      {item.count}
                    </span>
                  </div>

                  {/* Accessible Progress Bar */}
                  <div
                    role="progressbar"
                    aria-label={`Status konseling ${item.label}`}
                    aria-valuenow={item.count}
                    aria-valuemin={0}
                    aria-valuemax={total}
                    className="h-2.5 w-full overflow-hidden rounded-full bg-[#f5f8fc] dark:bg-[#071526]"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{
                        width: `${item.count > 0 ? Math.max(percentage, 6) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PRIVACY & SECURITY CALLOUT BOX (1 Baris Ringan / Ringkas) */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-3 text-xs leading-relaxed text-[#5b6b85] dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf] sm:mt-5">
          <Lock size={15} className="mt-0.5 shrink-0 text-[#5b6b85] dark:text-[#829dbf]" aria-hidden="true" />
          <p>
            Dashboard hanya menampilkan jumlah & status. Catatan pribadi siswa hanya terbuka di halaman detail berotorisasi BK.
          </p>
        </div>
      </div>

      {/* FOOTER LINK (Min Touch Target 44px) */}
      <div className="mt-4 border-t border-[#f5f8fc] pt-1 dark:border-[#163863]">
        <Link
          href="/bk/konseling"
          className="group inline-flex min-h-[44px] w-full items-center justify-between text-xs font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:text-[#f4c542] dark:hover:text-[#ffd66b]"
        >
          <span>Kelola konseling</span>
          <ArrowRight
            size={14}
            className="shrink-0 transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}