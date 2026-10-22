"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Stethoscope,
  Coins,
  Gamepad2,
  Users,
  Compass,
  Check,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { ButirMasalah } from "@/constants/angket-masalah.constant";

interface AngketFormViewProps {
  questions: ButirMasalah[];
  selectedIds: Set<number>;
  onToggleId: (id: number) => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  onBackToIntro: () => void;
}

interface CategoryConfig {
  key: string;
  name: string;
  label: string;
  range: string;
  icon: typeof Stethoscope;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "Pribadi/Kesehatan",
    name: "Pribadi / Kesehatan",
    label: "Pribadi/Kesehatan",
    range: "Butir 1 – 20",
    icon: Stethoscope,
  },
  {
    key: "Kehidupan Ekonomi",
    name: "Kehidupan Ekonomi",
    label: "Kehidupan Ekonomi",
    range: "Butir 21 – 40",
    icon: Coins,
  },
  {
    key: "Rekreasi dan Waktu Luang",
    name: "Rekreasi & Waktu Luang",
    label: "Rekreasi dan Waktu Luang",
    range: "Butir 41 – 60",
    icon: Gamepad2,
  },
  {
    key: "Kehidupan Keluarga",
    name: "Kehidupan Keluarga",
    label: "Kehidupan Keluarga",
    range: "Butir 61 – 80",
    icon: Users,
  },
  {
    key: "Agama dan Moral",
    name: "Agama dan Moral",
    label: "Agama dan Moral",
    range: "Butir 81 – 99",
    icon: Compass,
  },
];

export function AngketFormView({
  questions,
  selectedIds,
  onToggleId,
  onSubmit,
  isSubmitting,
  submitError,
  onBackToIntro,
}: AngketFormViewProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const containerTopRef = useRef<HTMLDivElement>(null);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const CategoryIcon = currentCategory.icon;

  // Filter butir sesuai kategori aktif
  const currentQuestions = useMemo(() => {
    return questions.filter((q) => q.kategori === currentCategory.key);
  }, [questions, currentCategory.key]);

  // Hitung jumlah butir yang dipilih di kategori aktif
  const selectedCountInCategory = useMemo(() => {
    return currentQuestions.filter((q) => selectedIds.has(q.id)).length;
  }, [currentQuestions, selectedIds]);

  const totalSelectedCount = selectedIds.size;
  const progressPercent = ((currentCategoryIndex + 1) / CATEGORIES.length) * 100;

  const scrollToTop = () => {
    if (containerTopRef.current) {
      containerTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNext = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      scrollToTop();
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      scrollToTop();
    } else {
      onBackToIntro();
    }
  };

  const handleConfirmSubmit = async () => {
    await onSubmit();
    setShowConfirmModal(false);
  };

  return (
    <div ref={containerTopRef} className="space-y-6">
      {/* 1. Bar Indikator Kategori & Progres */}
      <div className="w-full rounded-2xl bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-4 sm:p-5 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-3">
          <span className="text-[#071c38] dark:text-white">
            Kategori {currentCategoryIndex + 1} dari {CATEGORIES.length}
          </span>
          <span className="text-slate-500 dark:text-[#8ea7c5]">
            {selectedCountInCategory} butir dipilih
          </span>
        </div>

        {/* Progress Bar Kuning Emas */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#153457] overflow-hidden"
        >
          <div
            className="h-full bg-[#f4c542] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Header Kategori Aktif */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4c542]/20 text-[#071c38] dark:bg-[#f4c542]/15 dark:text-[#f4c542]">
          <CategoryIcon size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#071c38] dark:text-white tracking-tight">
            {currentCategory.name}
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-[#8ea7c5] mt-0.5">
            {currentCategory.range}
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9bb3ce] mt-1.5 leading-relaxed">
            Centang hanya masalah yang{" "}
            <strong className="font-bold text-slate-800 dark:text-white">sedang kamu alami</strong>.
          </p>
        </div>
      </div>

      {/* Pesan Error Submisi jika ada */}
      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2.5">
          <AlertCircle size={18} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 3. Daftar Butir Checkbox Kategori Aktif */}
      <div className="space-y-3" role="group" aria-label={`Daftar butir ${currentCategory.name}`}>
        {currentQuestions.map((item) => {
          const isSelected = selectedIds.has(item.id);

          return (
            <div
              key={item.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onToggleId(item.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  onToggleId(item.id);
                }
              }}
              className={[
                "group relative flex items-start gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl p-3.5 sm:p-4.5 cursor-pointer transition-all duration-150 select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542]",
                isSelected
                  ? "bg-[#fffdeb] border-2 border-amber-300 shadow-sm dark:bg-[#252212] dark:border-amber-500/70"
                  : "bg-white border border-slate-200/90 hover:border-slate-300 dark:bg-[#0d2138] dark:border-[#173456] dark:hover:border-[#224873]",
              ].join(" ")}
            >
              {/* Checkbox Visual Custom */}
              <div
                className={[
                  "mt-0.5 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                  isSelected
                    ? "border-[#f4c542] bg-[#f4c542] text-[#071526]"
                    : "border-slate-300 bg-white group-hover:border-slate-400 dark:border-slate-600 dark:bg-[#071526]",
                ].join(" ")}
                aria-hidden="true"
              >
                {isSelected && <Check size={14} strokeWidth={3} className="sm:w-4 sm:h-4" />}
              </div>

              {/* Nomor Butir */}
              <span className="mt-0.5 min-w-[24px] sm:min-w-[28px] text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400 select-none">
                {item.id}.
              </span>

              {/* Teks Deskripsi Pertanyaan (Tanpa Truncate) */}
              <span
                className={[
                  "flex-1 text-xs sm:text-sm leading-relaxed break-words transition-colors",
                  isSelected
                    ? "font-semibold text-slate-900 dark:text-white"
                    : "font-normal text-slate-700 dark:text-slate-200",
                ].join(" ")}
              >
                {item.deskripsi}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Navigasi Bawah */}
      <div className="flex items-center justify-between pt-4 sm:pt-6">
        {/* Tombol Kembali */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={isSubmitting}
          className="inline-flex min-h-[44px] items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 dark:text-[#a3b7cf] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] rounded-xl px-3 py-2 disabled:opacity-50"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          <span>Kembali</span>
        </button>

        {/* Tombol Lanjut / Kirim Angket */}
        {currentCategoryIndex < CATEGORIES.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl sm:rounded-2xl bg-[#071c38] hover:bg-[#0b284e] active:scale-95 px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542]"
          >
            <span>Lanjut</span>
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl sm:rounded-2xl bg-[#f4c542] hover:bg-[#e2b435] active:scale-95 px-6 sm:px-8 py-2.5 text-xs sm:text-sm font-bold text-[#071526] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#071c38] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span>Kirim Angket</span>
                <Send size={15} strokeWidth={2.3} />
              </>
            )}
          </button>
        )}
      </div>

      {/* 5. Modal Konfirmasi Pengiriman */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0d2138] border border-slate-200 dark:border-[#173456] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-[#1a3556] dark:text-[#f4c542]">
                <HelpCircle size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Konfirmasi Pengiriman
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8ea7c5] mt-0.5">
                  Periksa kembali pilihanmu
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9bb3ce] leading-relaxed">
              Kamu telah memilih total{" "}
              <strong className="font-bold text-slate-900 dark:text-white">
                {totalSelectedCount} butir masalah
              </strong>
              . Setelah dikirim, jawaban angket akan disimpan dan{" "}
              <strong className="font-bold text-slate-900 dark:text-white">
                tidak dapat diubah kembali
              </strong>
              .
            </p>

            {totalSelectedCount === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                ⚠️ Kamu belum memilih butir masalah sama sekali. Sistem memerlukan minimal 1 butir masalah yang dipilih untuk dapat disimpan.
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-[#8ea7c5] dark:hover:text-white rounded-xl"
              >
                Cek Lagi
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting || totalSelectedCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f4c542] hover:bg-[#e2b435] text-[#071526] font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Ya, Kirim Sekarang</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
