"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { KonselingDetailView } from "@/components/siswa/konseling/KonselingDetailView";
import { KonselingItem } from "@/components/siswa/konseling/KonselingTypes";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";

interface SiswaDetailKonselingPageProps {
  params: Promise<{ id: string }>;
}

export default function SiswaDetailKonselingPage({
  params,
}: SiswaDetailKonselingPageProps) {
  // Gunakan React 19 use() untuk membaca route params secara sinkron & aman dari SSR/streaming
  const resolvedParams = use(params);
  const rawId = resolvedParams?.id;
  const parsedId = Number(rawId);
  const isValidId = Number.isInteger(parsedId) && parsedId > 0;

  const { get } = useApiClient();
  const [session, setSession] = useState<KonselingItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Hanya jalankan effect fetch jika ID valid
    if (!isValidId) return;

    let isMounted = true;

    async function loadDetail() {
      try {
        const response = await get<KonselingItem>(`/api/siswa/konseling/${parsedId}`);

        if (!isMounted) return;

        if (!response.success || !response.data) {
          throw new Error(response.message || "Gagal memuat detail sesi konseling.");
        }

        setSession(response.data);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = formatErrorMessage(err);
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [isValidId, parsedId, get, reloadKey]);

  // Jika ID route tidak valid, langsung tampilkan pesan penolakan bersih tanpa memicu effect
  if (!isValidId) {
    return (
      <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
            <h2 className="mt-3 text-lg font-bold text-red-900 dark:text-red-300">
              ID Sesi Konseling Tidak Valid
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400 max-w-md mx-auto">
              ID sesi konseling pada tautan tidak sesuai. Pastikan Anda mengakses sesi konseling melalui daftar riwayat resmi.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/siswa/konseling"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={15} />
                <span>Kembali ke Riwayat</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-700" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 text-center dark:border-red-900/60 dark:bg-red-950/30">
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
            <h2 className="mt-3 text-lg font-bold text-red-900 dark:text-red-300">
              Gagal Memuat Detail Konseling
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-400 max-w-md mx-auto">
              {error}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="/siswa/konseling"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={15} />
                <span>Kembali ke Riwayat</span>
              </Link>
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={15} />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        ) : session ? (
          <KonselingDetailView initialSession={session} />
        ) : null}
      </div>
    </div>
  );
}
