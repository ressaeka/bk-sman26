"use client";

import React from "react";
import { Lock, FileCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface AngketIntroViewProps {
  onStart: () => void;
}

export function AngketIntroView({ onStart }: AngketIntroViewProps) {
  return (
    <div className="w-full rounded-2xl sm:rounded-[28px] bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-5 sm:p-9 shadow-sm transition-colors duration-200">
      {/* Judul Card */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#071c38] dark:text-white tracking-tight">
        Sebelum mulai
      </h2>

      {/* Deskripsi Pengantar */}
      <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-[#9bb3ce] leading-relaxed">
        Kamu akan melihat 99 butir masalah dalam 5 kategori.{" "}
        <strong className="font-bold text-slate-800 dark:text-white">Centang</strong> hanya butir
        yang{" "}
        <strong className="font-bold text-slate-800 dark:text-white">sedang kamu alami</strong>,
        kosongkan yang tidak. Tidak ada jawaban benar atau salah, jadi jawablah dengan jujur.
      </p>

      {/* Grid Informasi Ketentuan (Tanpa Estimasi Waktu / Timer) */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Info Butir */}
        <div className="rounded-2xl bg-[#f8f9fc] dark:bg-[#102742] border border-slate-200/80 dark:border-[#17385e] p-4 sm:p-5 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-[#153457] dark:text-blue-400">
            <FileCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              99 butir
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8ea7c5]">
              dalam 5 kategori
            </p>
          </div>
        </div>

        {/* Info Satu Kali Pengisian */}
        <div className="rounded-2xl bg-[#f8f9fc] dark:bg-[#102742] border border-slate-200/80 dark:border-[#17385e] p-4 sm:p-5 flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-[#252834] dark:text-amber-400">
            <CheckCircle2 size={22} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              1 kali tes
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-[#8ea7c5]">
              tidak dapat diulang
            </p>
          </div>
        </div>
      </div>

      {/* Pemberitahuan Privasi */}
      <div className="mt-6 flex items-start gap-3.5 rounded-2xl bg-blue-50/90 dark:bg-[#102a49] border border-blue-100/90 dark:border-[#1a416e] p-4 sm:p-5 text-xs sm:text-sm text-slate-700 dark:text-[#9bb3ce] leading-relaxed">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100/80 dark:bg-[#252834] text-amber-600 dark:text-[#f4c542] mt-0.5">
          <Lock size={16} strokeWidth={2.3} />
        </div>
        <p>
          <strong className="font-bold text-slate-900 dark:text-white">Hasilnya rahasia.</strong>{" "}
          Jawabanmu tidak ditampilkan di akunmu dan hanya dapat dilihat oleh guru BK untuk
          keperluan bimbingan.
        </p>
      </div>

      {/* Tombol Mulai Angket */}
      <div className="mt-7 sm:mt-8">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full sm:rounded-2xl bg-[#f4c542] hover:bg-[#e5b736] active:scale-95 px-6 sm:px-8 py-3 text-sm sm:text-base font-bold text-[#071526] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542]"
        >
          <span>Mulai Angket</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
