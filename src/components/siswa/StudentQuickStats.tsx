"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import { StudentProfile } from "@/hooks/useStudentDashboardData";

interface StudentQuickStatsProps {
  profile: StudentProfile | null;
  profileLoading?: boolean;
}

export function StudentQuickStats({
  profile,
  profileLoading = false,
}: StudentQuickStatsProps) {
  const totalPoin = profile ? profile.totalPoin : 0;

  const getStatusText = (poin: number) => {
    if (poin >= 100) return "Sanksi Maksimal";
    if (poin >= 75) return "Peringatan Terakhir";
    if (poin >= 50) return "Peringatan 2";
    if (poin >= 25) return "Peringatan 1";
    return "Disiplin / Bersih";
  };

  const getStatusStyle = (poin: number) => {
    if (poin >= 50) {
      return "text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400";
    }

    if (poin >= 25) {
      return "text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400";
    }

    return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400";
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
      {/* 1. Mini Card Poin Pelanggaran */}
      <Link
        href="/siswa/pelanggaran"
        className="group flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all hover:shadow dark:border-[#173456] dark:bg-[#0d2138] sm:p-4"
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-[11px] font-semibold leading-relaxed text-slate-500 dark:text-[#8ea7c5] sm:text-xs">
              Poin Pelanggaran
            </span>

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-[#1a3556] dark:text-[#f4c542]">
              <AlertTriangle size={13} aria-hidden="true" />
            </div>
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="break-words text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {profileLoading ? "..." : totalPoin}
            </span>

            <span className="text-[11px] text-slate-400 dark:text-[#708dae]">
              poin
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex min-w-0 items-start justify-between gap-2 border-t border-slate-100 pt-2 dark:border-[#163863]">
          <span
            className={`inline-flex min-w-0 max-w-full items-center rounded px-1.5 py-1 text-[10px] font-semibold leading-tight whitespace-normal break-words ${getStatusStyle(
              totalPoin
            )}`}
          >
            {profileLoading ? "Memuat..." : getStatusText(totalPoin)}
          </span>

          <ArrowRight
            size={14}
            className="mt-0.5 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400"
            aria-hidden="true"
          />
        </div>
      </Link>

      {/* 2. Mini Card Jadwal Asesmen */}
      <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm dark:border-[#173456] dark:bg-[#0d2138] sm:p-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 text-[11px] font-semibold leading-relaxed text-slate-500 dark:text-[#8ea7c5] sm:text-xs">
              Jadwal Asesmen
            </span>

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-[#153457] dark:text-blue-400">
              <Calendar size={13} aria-hidden="true" />
            </div>
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              0
            </span>

            <span className="text-[11px] text-slate-400 dark:text-[#708dae]">
              aktif
            </span>
          </div>
        </div>

        <div className="mt-2.5 min-w-0 border-t border-slate-100 pt-2 dark:border-[#163863]">
          <span className="inline-flex max-w-full items-center rounded bg-slate-100 px-1.5 py-1 text-[10px] font-semibold leading-tight whitespace-normal break-words text-slate-600 dark:bg-[#163863] dark:text-[#8ea7c5]">
            Belum Terjadwal
          </span>
        </div>
      </div>
    </div>
  );
}