"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { StudentProfile } from "@/hooks/useStudentDashboardData";

interface WelcomeCardProps {
  profile: StudentProfile | null;
  profileLoading?: boolean;
}

export function WelcomeCard({ profile, profileLoading = false }: WelcomeCardProps) {
  const firstName = profile?.nama
    ? profile.nama.trim().split(/\s+/)[0]
    : profileLoading
    ? "..."
    : "Siswa";

  return (
    <div className="relative w-full rounded-2xl sm:rounded-[22px] bg-[#071c38] border border-[#143257] p-3.5 sm:p-6 shadow-sm overflow-hidden text-white transition-all">
      {/* Background glow ambient */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-[#185bc3]/20 blur-2xl sm:blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Sisi Kiri: Sapaan Personal Siswa Ringkas */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#f4c542] fill-[#f4c542] shrink-0 sm:w-5 sm:h-5" />
            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
              Halo, {firstName} <span className="select-none">👋</span>
            </h2>
          </div>

          <p className="text-xs sm:text-[13px] text-[#9bb3ce] leading-relaxed mt-1 sm:mt-2">
            Selamat datang di Sistem Informasi Bimbingan Konseling SMAN 26 Kab. Tangerang.
            <span className="hidden sm:inline"> Pantau jadwal asesmen, konseling, dan perkembanganmu di sini.</span>
          </p>
        </div>

        {/* Sisi Kanan: Bintang Geometris Emas (Hanya di layar desktop/tablet) */}
        <div className="hidden md:flex items-center gap-2.5 pr-4 select-none opacity-90 shrink-0" aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#f4c542" className="text-[#f4c542]">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#f4c542" className="text-[#f4c542] -mt-5">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
