"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  FileText,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";

interface BkStatCardsProps {
  totalSiswa: number;
  konselingPendingCount: number;
  activeSchedulesCount: number;
  criticalStudentsCount: number;
  isLoading?: boolean;
}

export function BkStatCards({
  totalSiswa,
  konselingPendingCount,
  activeSchedulesCount,
  criticalStudentsCount,
  isLoading = false,
}: BkStatCardsProps) {
  const cards = [
    {
      title: "Total Siswa",
      value: totalSiswa,
      suffix: "aktif",
      icon: Users,
      iconBg: "bg-[#f5f8fc] text-[#071a3a] dark:bg-[#10243d] dark:text-white",
      href: "/bk/siswa",
      linkText: "Data Siswa",
    },
    {
      title: "Pengajuan Konseling Menunggu",
      value: konselingPendingCount,
      suffix: "perlu respons",
      icon: MessageSquare,
      iconBg: "bg-[#fef6da] text-[#b85b08] dark:bg-[#2e2712] dark:text-[#fcd34d]",
      href: "/bk/konseling",
      linkText: "Proses pengajuan",
      highlightBorder:
        konselingPendingCount > 0
          ? "border-[#f4c542]/60 dark:border-[#f4c542]/50"
          : "",
    },
    {
      title: "Asesmen Sedang Berlangsung",
      value: activeSchedulesCount,
      suffix: "dari 3 jenis",
      icon: FileText,
      iconBg: "bg-[#ecfdf5] text-[#107a55] dark:bg-[#0d332e] dark:text-[#34d399]",
      href: "/bk/jadwal-asesmen",
      linkText: "Jadwal Asesmen",
    },
    {
      title: "Siswa Perlu Tindak Lanjut",
      value: criticalStudentsCount,
      suffix: "siswa",
      icon: AlertTriangle,
      iconBg: "bg-[#fff7ed] text-[#b85b08] dark:bg-amber-950/50 dark:text-amber-400",
      href: "/bk/pelanggaran",
      linkText: "Lihat daftar",
    },
  ];

  return (
    <section aria-labelledby="stat-summary-heading" className="space-y-3 sm:space-y-3.5">
      <h2 id="stat-summary-heading" className="sr-only">
        Ringkasan Angka Statistik Bimbingan Konseling
      </h2>

      {/* 4 KARTU STATISTIK (Mobile: Grid 2x2, Desktop: Grid 4) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-3.5 shadow-xs transition-all duration-150 hover:border-[#0b2552]/40 hover:shadow-sm dark:border-[#173456] dark:bg-[#0d2138] dark:hover:border-[#38bdf8]/40 sm:p-4 lg:p-5 ${
                card.highlightBorder || ""
              }`}
            >
              <div>
                {/* Header Kartu: Ikon & Judul */}
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-9 sm:w-9 sm:rounded-xl ${card.iconBg}`}
                    aria-hidden="true"
                  >
                    <Icon size={18} className="sm:h-5 sm:w-5" />
                  </div>
                  <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-[#5b6b85] dark:text-[#829dbf] sm:text-[13px] sm:leading-snug">
                    {card.title}
                  </h3>
                </div>

                {/* Angka Statistik Utama */}
                <div className="mt-3 flex flex-wrap items-baseline gap-1.5 sm:mt-4 sm:gap-2">
                  {isLoading ? (
                    <div className="h-8 w-16 animate-pulse rounded-lg bg-[#e6ebf3] dark:bg-[#163863] sm:h-9" />
                  ) : (
                    <span className="text-2xl font-extrabold tracking-tight tabular-nums text-[#071a3a] dark:text-white sm:text-3xl">
                      {card.value}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] sm:text-xs">
                    {card.suffix}
                  </span>
                </div>
              </div>

              {/* Tautan Aksi (Min Touch Target 44px) */}
              <div className="mt-3 border-t border-[#f5f8fc] pt-1 dark:border-[#163863]">
                <Link
                  href={card.href}
                  className="group inline-flex min-h-[44px] w-full items-center justify-between text-xs font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:text-[#f4c542] dark:hover:text-[#ffd66b]"
                >
                  <span className="truncate">{card.linkText}</span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 transition-transform duration-150 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Catatan Sumber Data: 1 Baris Ringan */}
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] sm:text-xs">
        <Info size={14} className="shrink-0 text-[#107a55] dark:text-[#34d399]" aria-hidden="true" />
        <span className="truncate">
          Angka pada dashboard bersumber dari database operasional aktual SMAN 26.
        </span>
      </div>
    </section>
  );
}
