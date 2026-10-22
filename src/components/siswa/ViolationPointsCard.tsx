"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { StudentProfile } from "@/hooks/useStudentDashboardData";

interface ViolationPointsCardProps {
  profile: StudentProfile | null;
  profileLoading?: boolean;
}

export function ViolationPointsCard({
  profile,
  profileLoading = false,
}: ViolationPointsCardProps) {
  const totalPoin = profile ? profile.totalPoin : 0;

  let badgeLabel = "Disiplin / Bersih";
  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#0d332e] dark:text-[#34d399] dark:border-[#155449]";
  let nextThreshold = 25;
  let nextWarning = "Peringatan 1";

  if (totalPoin >= 100) {
    badgeLabel = "Sanksi Maksimal";
    badgeStyle = "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/80 dark:text-red-400 dark:border-red-800";
    nextThreshold = 100;
    nextWarning = "Tindakan Khusus";
  } else if (totalPoin >= 75) {
    badgeLabel = "Peringatan Terakhir";
    badgeStyle = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60";
    nextThreshold = 100;
    nextWarning = "Sanksi Maksimal";
  } else if (totalPoin >= 50) {
    badgeLabel = "Peringatan 2";
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#2e2712] dark:text-[#fcd34d] dark:border-[#524318]";
    nextThreshold = 75;
    nextWarning = "Peringatan Terakhir";
  } else if (totalPoin >= 25) {
    badgeLabel = "Peringatan 1";
    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200 dark:bg-[#2e2712] dark:text-[#fcd34d] dark:border-[#524318]";
    nextThreshold = 50;
    nextWarning = "Peringatan 2";
  } else if (totalPoin > 0) {
    badgeLabel = "Disiplin / Aman";
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#0d332e] dark:text-[#34d399] dark:border-[#155449]";
    nextThreshold = 25;
    nextWarning = "Peringatan 1";
  }

  const pointsRemaining = Math.max(0, nextThreshold - totalPoin);

  return (
    <div className="w-full rounded-2xl sm:rounded-[20px] bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-3.5 sm:p-5 shadow-sm transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Header Kartu */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-[#163863]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={17} className="text-slate-700 dark:text-slate-300 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Poin pelanggaran
            </h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold ${badgeStyle}`}
          >
            {profileLoading ? "Memuat..." : badgeLabel}
          </span>
        </div>

        {/* Skor Angka Poin Real-time dari Database */}
        <div className="flex items-baseline gap-1.5 my-2 sm:my-3">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {profileLoading ? "..." : totalPoin}
          </span>
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-[#708dae]">
            poin
          </span>
        </div>

        {/* Bar Indikator Poin Pelanggaran */}
        <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-slate-200/80 dark:bg-[#153457] overflow-hidden my-2">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-[#f4c542] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, totalPoin))}%` }}
          />
        </div>

        {/* Skala Ambang Batas Pasal 8 */}
        <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-[#708dae] px-0.5">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>

        {/* Pesan Keterangan Ambang Batas */}
        <p className="text-xs text-slate-600 dark:text-[#8fa6c1] leading-relaxed mt-2.5 sm:mt-3">
          {totalPoin === 0 ? (
            <span>Catatan kedisiplinanmu bersih.</span>
          ) : totalPoin >= 100 ? (
            <span className="text-red-600 dark:text-red-300">
              Poin telah mencapai ambang maksimal. Segera hubungi Guru BK.
            </span>
          ) : (
            <span>
              Butuh{" "}
              <strong className="text-slate-900 dark:text-white font-bold">{pointsRemaining} poin</strong>{" "}
              sebelum naik ke {nextWarning}.
            </span>
          )}
        </p>
      </div>

      {/* Link Rincian Pelanggaran */}
      <div className="mt-3.5 sm:mt-4 pt-2.5 border-t border-slate-100 dark:border-[#163863]">
        <Link
          href="/siswa/pelanggaran"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <span>Lihat rincian</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
