"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, RefreshCw, Lock } from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";
import { ButirMasalah } from "@/constants/angket-masalah.constant";
import { AngketIntroView } from "@/components/siswa/angket-masalah/AngketIntroView";
import { AngketFormView } from "@/components/siswa/angket-masalah/AngketFormView";
import {
  AngketSubmittedView,
  AngketSubmittedData,
} from "@/components/siswa/angket-masalah/AngketSubmittedView";

type AngketStep = "INTRO" | "FORM" | "SUBMITTED";

export default function AngketMasalahPage() {
  const { get, post } = useApiClient();

  const [step, setStep] = useState<AngketStep>("INTRO");
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ButirMasalah[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submittedData, setSubmittedData] = useState<AngketSubmittedData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setInitialLoading(true);
    setFetchError(null);
    setReloadKey((prev) => prev + 1);
  };

  // Ambil riwayat hasil asesmen siswa dari backend
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // 1. Cek riwayat submisi sebelumnya
        const resultRes = await get<AngketSubmittedData | null>(
          "/api/siswa/assessment/angket-masalah/result"
        );

        if (!isMounted) return;

        if (!resultRes.success) {
          throw new Error(resultRes.message || "Gagal memeriksa status angket.");
        }

        if (resultRes.data) {
          setSubmittedData(resultRes.data);
          setStep("SUBMITTED");
        } else {
          setStep("INTRO");
        }

        // 2. Muat bank butir pertanyaan dari endpoint resmi backend
        const questionsRes = await get<ButirMasalah[]>(
          "/api/siswa/assessment/angket-masalah/questions"
        );

        if (!isMounted) return;

        if (
          !questionsRes.success ||
          !Array.isArray(questionsRes.data) ||
          questionsRes.data.length === 0
        ) {
          throw new Error(
            questionsRes.message || "Gagal memuat daftar butir angket dari server."
          );
        }

        setQuestions(questionsRes.data);
      } catch (err) {
        if (isMounted) {
          setFetchError(
            formatErrorMessage(err) ||
              "Gagal memuat status dan butir angket dari server. Periksa koneksi Anda."
          );
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [get, reloadKey]);

  // Handler toggle butir terpilih
  const handleToggleId = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handler submit final ke backend
  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      setSubmitError("Pilih minimal 1 butir masalah yang sedang dialami.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await post<AngketSubmittedData>(
        "/api/siswa/assessment/angket-masalah/submit",
        {
          masalahIds: Array.from(selectedIds),
        }
      );

      if (res.success && res.data) {
        setSubmittedData(res.data);
        setStep("SUBMITTED");
      } else {
        setSubmitError(res.message || "Gagal menyimpan jawaban angket.");
      }
    } catch (err) {
      setSubmitError(formatErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[960px] px-3.5 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6">
      {/* Header Halaman (Konsisten di semua tahap) */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071c38] dark:text-white tracking-tight">
          Angket Masalah
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9bb3ce] mt-1">
          Sampaikan masalah yang sedang kamu alami kepada guru BK
        </p>
      </div>

      {/* Konten Berdasarkan Tahap */}
      {initialLoading ? (
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-2xl bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-8">
          <Loader2 size={36} className="animate-spin text-amber-500 mb-3" />
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-[#9bb3ce]">
            Memeriksa status angket...
          </p>
        </div>
      ) : fetchError ? (
        <div className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-2xl bg-white dark:bg-[#0d2138] border border-amber-200 dark:border-amber-900/60 p-6 sm:p-8 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            {fetchError.toLowerCase().includes("jadwal") || fetchError.toLowerCase().includes("akses ditolak") ? (
              <Lock size={24} />
            ) : (
              <AlertTriangle size={24} />
            )}
          </div>
          <div className="max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {fetchError.toLowerCase().includes("jadwal") || fetchError.toLowerCase().includes("akses ditolak")
                ? "Akses Angket Masalah Terkunci"
                : "Gagal Memuat Status Angket"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#9bb3ce] leading-relaxed">
              {fetchError}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all"
            >
              <RefreshCw size={14} />
              <span>Coba Lagi</span>
            </button>
            <Link
              href="/siswa"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f4c542] hover:bg-[#e2b435] text-[#071526] font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <span>Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      ) : step === "SUBMITTED" && submittedData ? (
        <AngketSubmittedView data={submittedData} />
      ) : step === "FORM" ? (
        <AngketFormView
          questions={questions}
          selectedIds={selectedIds}
          onToggleId={handleToggleId}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onBackToIntro={() => setStep("INTRO")}
        />
      ) : (
        <AngketIntroView onStart={() => setStep("FORM")} />
      )}
    </div>
  );
}
