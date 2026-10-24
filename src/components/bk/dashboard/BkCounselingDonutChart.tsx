"use client";

import React from "react";
import { MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

interface BkCounselingDonutChartProps {
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
  rejectedCount: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BkCounselingDonutChart({
  pendingCount,
  approvedCount,
  completedCount,
  rejectedCount,
  isLoading = false,
  error = null,
  onRetry,
}: BkCounselingDonutChartProps) {
  const total = pendingCount + approvedCount + completedCount + rejectedCount;

  // Hitung persentase untuk setiap status
  const calcPercent = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  const pendingPercent = calcPercent(pendingCount);
  const approvedPercent = calcPercent(approvedCount);
  const completedPercent = calcPercent(completedCount);
  const rejectedPercent =
    total > 0
      ? Math.max(0, 100 - pendingPercent - approvedPercent - completedPercent)
      : 0;

  // Geometri Donut SVG (Keliling lingkaran: 2 * PI * r)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Offset proporsional untuk masing-masing busur
  const pendingStroke = (pendingPercent / 100) * circumference;
  const approvedStroke = (approvedPercent / 100) * circumference;
  const completedStroke = (completedPercent / 100) * circumference;
  const rejectedStroke = (rejectedPercent / 100) * circumference;

  const pendingOffset = 0;
  const approvedOffset = -pendingStroke;
  const completedOffset = -(pendingStroke + approvedStroke);
  const rejectedOffset = -(pendingStroke + approvedStroke + completedStroke);

  return (
    <section
      aria-labelledby="counseling-status-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4.5 shadow-sm transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue-950/70 dark:text-blue-400"
            aria-hidden="true"
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <h3
              id="counseling-status-heading"
              className="text-[15px] font-bold text-[#071a3a] dark:text-white sm:text-[16px]"
            >
              Status Konseling
            </h3>
            <p className="text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
              Pengajuan sesi semester ini
            </p>
          </div>
        </div>

        {/* DONUT CHART KONTEN */}
        {error && !isLoading ? (
          <div className="mt-5 flex h-[160px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/40 dark:bg-red-950/30">
            <AlertCircle size={22} className="text-red-500" />
            <p className="mt-2 text-[12.5px] font-bold text-red-800 dark:text-red-300">
              Gagal Memuat Status Konseling
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
          <div className="mt-5 flex flex-col items-center justify-center gap-5 sm:flex-row sm:justify-around">
            {/* LINGKARAN DONUT SVG */}
            <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center">
              {isLoading ? (
                <div className="h-28 w-28 animate-pulse rounded-full border-8 border-slate-200 dark:border-slate-700" />
              ) : total === 0 ? (
                <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="14"
                    className="text-[#e6ebf3] dark:text-[#173456]"
                  />
                </svg>
              ) : (
              <svg className="h-full w-full -rotate-90" viewBox="0 0 110 110">
                {/* Background track */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-[#e6ebf3]/60 dark:text-[#173456]/50"
                />

                {/* Selesai (Emerald Green #10b981) */}
                {completedPercent > 0 && (
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="14"
                    strokeDasharray={`${completedStroke} ${circumference}`}
                    strokeDashoffset={completedOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700"
                  />
                )}

                {/* Disetujui (Sky Blue #38bdf8) */}
                {approvedPercent > 0 && (
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="#38bdf8"
                    strokeWidth="14"
                    strokeDasharray={`${approvedStroke} ${circumference}`}
                    strokeDashoffset={approvedOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700"
                  />
                )}

                {/* Menunggu (Kuning Emas #f4c542) */}
                {pendingPercent > 0 && (
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="#f4c542"
                    strokeWidth="14"
                    strokeDasharray={`${pendingStroke} ${circumference}`}
                    strokeDashoffset={pendingOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700"
                  />
                )}

                {/* Ditolak (Orange #f97316) */}
                {rejectedPercent > 0 && (
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="14"
                    strokeDasharray={`${rejectedStroke} ${circumference}`}
                    strokeDashoffset={rejectedOffset}
                    strokeLinecap="butt"
                    className="transition-all duration-700"
                  />
                )}
              </svg>
            )}

            {/* Label Tengah Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[20px] font-extrabold tracking-tight tabular-nums text-[#071a3a] dark:text-white sm:text-[22px]">
                {isLoading ? "..." : total}
              </span>
              <span className="text-[10px] font-semibold text-[#5b6b85] dark:text-[#829dbf] uppercase tracking-wider">
                Pengajuan
              </span>
            </div>
          </div>

          {/* DAFTAR LEGENDA STATUS & JUMLAH */}
          <div className="w-full space-y-2 sm:max-w-[190px]">
            {/* 1. Menunggu */}
            <div className="flex items-center justify-between text-[12px] sm:text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f4c542]" aria-hidden="true" />
                <span className="text-[#5b6b85] dark:text-[#829dbf]">Menunggu</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold tabular-nums text-[#071a3a] dark:text-white">
                <span>{isLoading ? "-" : pendingCount}</span>
                <span className="text-[11px] font-normal text-[#5b6b85] dark:text-[#829dbf]">
                  ({pendingPercent}%)
                </span>
              </div>
            </div>

            {/* 2. Disetujui */}
            <div className="flex items-center justify-between text-[12px] sm:text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" aria-hidden="true" />
                <span className="text-[#5b6b85] dark:text-[#829dbf]">Disetujui</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold tabular-nums text-[#071a3a] dark:text-white">
                <span>{isLoading ? "-" : approvedCount}</span>
                <span className="text-[11px] font-normal text-[#5b6b85] dark:text-[#829dbf]">
                  ({approvedPercent}%)
                </span>
              </div>
            </div>

            {/* 3. Selesai */}
            <div className="flex items-center justify-between text-[12px] sm:text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" aria-hidden="true" />
                <span className="text-[#5b6b85] dark:text-[#829dbf]">Selesai</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold tabular-nums text-[#071a3a] dark:text-white">
                <span>{isLoading ? "-" : completedCount}</span>
                <span className="text-[11px] font-normal text-[#5b6b85] dark:text-[#829dbf]">
                  ({completedPercent}%)
                </span>
              </div>
            </div>

            {/* 4. Ditolak */}
            <div className="flex items-center justify-between text-[12px] sm:text-[12.5px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" aria-hidden="true" />
                <span className="text-[#5b6b85] dark:text-[#829dbf]">Ditolak</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold tabular-nums text-[#071a3a] dark:text-white">
                <span>{isLoading ? "-" : rejectedCount}</span>
                <span className="text-[11px] font-normal text-[#5b6b85] dark:text-[#829dbf]">
                  ({rejectedPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* FOOTER NOTE RINGAN */}
      <div className="mt-4 border-t border-[#f5f8fc] pt-3 text-[11px] text-[#5b6b85] dark:border-[#163863] dark:text-[#829dbf]">
        Data diperbarui otomatis dari sistem permohonan konseling siswa.
      </div>
    </section>
  );
}
