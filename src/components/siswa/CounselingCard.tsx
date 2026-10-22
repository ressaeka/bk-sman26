"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Calendar, Clock, MapPin, User } from "lucide-react";
import { CounselingSession } from "@/hooks/useStudentDashboardData";

interface CounselingCardProps {
  counseling: CounselingSession | null;
  counselingLoading?: boolean;
}

export function CounselingCard({
  counseling,
  counselingLoading = false,
}: CounselingCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DISETUJUI":
        return {
          label: "Disetujui",
          style: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-[#0d332e] dark:border-[#155449] dark:text-[#34d399]",
        };
      case "PENDING":
        return {
          label: "Menunggu Persetujuan",
          style: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-[#2e2712] dark:border-[#524318] dark:text-[#fcd34d]",
        };
      case "SELESAI":
        return {
          label: "Selesai",
          style: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-[#143356] dark:border-[#1d416b] dark:text-[#8fb4dc]",
        };
      case "DITOLAK":
        return {
          label: "Ditolak",
          style: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/70 dark:border-red-800 dark:text-red-300",
        };
      default:
        return {
          label: status,
          style: "bg-slate-100 border-slate-200 text-slate-700 dark:bg-[#163863] dark:border-[#20497e] dark:text-[#8ea7c5]",
        };
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-[20px] bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-3.5 sm:p-5 shadow-sm transition-colors duration-200 flex flex-col justify-between">
      <div>
        {/* Header Kartu */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-[#163863]">
          <div className="flex items-center gap-2">
            <MessageSquare size={17} className="text-slate-700 dark:text-slate-300 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Konseling
            </h3>
          </div>
          {counseling ? (
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] sm:text-xs font-semibold ${
                getStatusBadge(counseling.status).style
              }`}
            >
              {getStatusBadge(counseling.status).label}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#20497e] bg-slate-50 dark:bg-[#163863] text-slate-600 dark:text-[#8ea7c5] text-[10px] sm:text-[11px] font-medium">
              Tidak Ada Sesi Aktif
            </span>
          )}
        </div>

        {/* Kondisi Data Konseling Riil */}
        {counselingLoading ? (
          <div className="rounded-xl bg-slate-50 dark:bg-[#112946]/50 border border-slate-200/70 dark:border-[#1a3d66] p-4 mt-2 text-center text-xs text-slate-500 dark:text-[#708dae]">
            Memuat data konseling...
          </div>
        ) : counseling ? (
          /* Kotak Sesi Aktif */
          <Link
            href={`/siswa/konseling/${counseling.id}`}
            className="group block rounded-xl bg-slate-50 dark:bg-[#112946] border border-slate-200/70 dark:border-[#1a3d66] p-3 sm:p-4 mt-2 transition hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-xs"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-[#708dae]">
              {counseling.status === "DISETUJUI"
                ? "Jadwal temu konseling"
                : "Pengajuan konseling terakhir"}
            </p>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-400 mt-0.5 leading-snug transition-colors">
              {formatDate(counseling.tanggal)}
            </h4>

            <div className="mt-2.5 space-y-1.5 text-xs text-slate-600 dark:text-[#9bb2cd]">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400 dark:text-[#9bb2cd] shrink-0" />
                <span>{counseling.jam ? `${counseling.jam} WIB` : "Waktu menyusul"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-red-500 dark:text-[#f87171] shrink-0" />
                <span>Ruang Bimbingan Konseling SMAN 26</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={13} className="text-blue-500 dark:text-[#60a5fa] shrink-0" />
                <span className="truncate">
                  {counseling.counselor?.nama || "Menunggu Penugasan Guru BK"}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          /* Empty State Ringkas */
          <div className="py-4 sm:py-6 px-2 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 dark:bg-[#252834] text-amber-500 dark:text-amber-400 flex items-center justify-center mb-2.5 shadow-sm">
              <MessageSquare size={20} className="sm:w-6 sm:h-6" strokeWidth={2} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Belum Ada Sesi Konseling
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8fa6c1] leading-relaxed max-w-sm mt-1">
              Butuh teman bercerita atau bimbingan? Ajukan jadwal konseling dengan Guru BK.
            </p>
          </div>
        )}
      </div>

      {/* Tombol Aksi Nyaman Disentuh di Mobile */}
      <div className="grid grid-cols-2 gap-2 mt-3.5 sm:mt-4 pt-2.5 border-t border-slate-100 dark:border-[#163863]">
        <Link
          href="/siswa/konseling/ajukan"
          className="min-h-[38px] sm:min-h-[42px] px-3 rounded-xl bg-[#f4c542] hover:bg-[#e2b435] text-[#071526] font-bold text-xs sm:text-sm text-center shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Calendar size={14} />
          <span>Ajukan</span>
        </Link>
        <Link
          href="/siswa/konseling"
          className="min-h-[38px] sm:min-h-[42px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-[#163863] dark:hover:bg-[#1c4579] dark:border-[#20497e] dark:text-white font-semibold text-xs sm:text-sm text-center transition-colors flex items-center justify-center active:scale-95"
        >
          Riwayat
        </Link>
      </div>
    </div>
  );
}
