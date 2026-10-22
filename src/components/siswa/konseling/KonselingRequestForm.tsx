"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { TOPIK_OPTIONS } from "./KonselingTypes";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";

export function KonselingRequestForm() {
  const router = useRouter();
  const { post } = useApiClient();

  const [topik, setTopik] = useState<string>("Karier");
  const [tanggal, setTanggal] = useState<string>("");
  const [jam, setJam] = useState<string>("10.00 WIB");
  const [keluhan, setKeluhan] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const MAX_CHAR = 500;

  const timePresets = [
    "08.00 WIB",
    "09.00 WIB",
    "10.00 WIB",
    "11.00 WIB",
    "13.00 WIB",
    "14.00 WIB",
    "15.00 WIB",
  ];

  // Gunakan tanggal lokal, bukan UTC, agar tidak bergeser pada zona waktu WIB.
  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setClientError(null);
    setApiError(null);

    if (!topik.trim()) {
      setClientError("Silakan pilih topik konseling terlebih dahulu.");
      return;
    }

    if (!tanggal) {
      setClientError("Silakan pilih tanggal konseling yang diinginkan.");
      return;
    }

    if (tanggal < todayStr) {
      setClientError("Tanggal konseling tidak boleh sebelum hari ini.");
      return;
    }

    if (!jam.trim()) {
      setClientError("Silakan pilih jam konseling yang diinginkan.");
      return;
    }

    if (!keluhan.trim()) {
      setClientError("Silakan ceritakan singkat masalah atau kebutuhanmu.");
      return;
    }

    if (keluhan.trim().length > MAX_CHAR) {
      setClientError(
        `Cerita masalah melebihi batas maksimal ${MAX_CHAR} karakter.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await post<{ id: number }>("/api/siswa/konseling", {
        topik: topik.trim(),
        tanggal,
        jam: jam.trim(),
        keluhan: keluhan.trim(),
      });

      if (response.data && typeof response.data.id === "number") {
        router.push(`/siswa/konseling/${response.data.id}`);
      } else {
        router.push("/siswa/konseling");
      }

      router.refresh();
    } catch (err: unknown) {
      setApiError(formatErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-clip sm:space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#071c38] dark:text-white sm:text-3xl">
          Ajukan Konseling
        </h1>

        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6] sm:text-base">
          Ceritakan kebutuhanmu, guru BK akan meninjau pengajuanmu.
        </p>
      </header>

      {/* Error */}
      {(clientError || apiError) && (
        <div
          role="alert"
          className="flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <p className="min-w-0 break-words leading-relaxed">
            {clientError || apiError}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="min-w-0 space-y-5 sm:space-y-6">
        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-7 md:p-8">
          <div>
            <h2 className="text-lg font-bold text-[#071c38] dark:text-white sm:text-xl">
              Detail pengajuan
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-[#8ea7c5]">
              Isi informasi berikut dengan benar.
            </p>
          </div>

          {/* Topik */}
          <fieldset className="mt-6 min-w-0">
            <legend className="text-sm font-bold text-slate-800 dark:text-slate-200 sm:text-base">
              Topik konseling
            </legend>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              {TOPIK_OPTIONS.map((item) => {
                const isSelected = topik === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setTopik(item.value);
                      setClientError(null);
                    }}
                    className={`flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 sm:min-h-11 sm:rounded-full sm:px-5 ${
                      isSelected
                        ? "border border-[#f4c542] bg-[#f4c542] text-[#071c38] shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1c385c] dark:bg-[#071526] dark:text-[#a0b3c6] dark:hover:bg-[#10243d]"
                    }`}
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    <span className="break-words">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Tanggal dan jam */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
            <div className="min-w-0">
              <label
                htmlFor="input-tanggal"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 sm:text-base"
              >
                Tanggal diinginkan
              </label>

              <div className="relative mt-2">
                <Calendar
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="input-tanggal"
                  type="date"
                  min={todayStr}
                  value={tanggal}
                  onChange={(e) => {
                    setTanggal(e.target.value);
                    setClientError(null);
                  }}
                  required
                  className="min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/50 dark:border-[#1c385c] dark:bg-[#071526] dark:text-white sm:rounded-2xl sm:pl-11 sm:pr-3"
                />
              </div>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="input-jam"
                className="block text-sm font-bold text-slate-800 dark:text-slate-200 sm:text-base"
              >
                Jam diinginkan
              </label>

              <div className="relative mt-2">
                <Clock
                  size={18}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="input-jam"
                  value={jam}
                  onChange={(e) => {
                    setJam(e.target.value);
                    setClientError(null);
                  }}
                  required
                  className="min-h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/50 dark:border-[#1c385c] dark:bg-[#071526] dark:text-white sm:rounded-2xl sm:pl-11"
                >
                  {timePresets.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Keluhan */}
          <div className="mt-6 min-w-0">
            <label
              htmlFor="textarea-keluhan"
              className="block text-sm font-bold text-slate-800 dark:text-slate-200 sm:text-base"
            >
              Ceritakan singkat masalahmu
            </label>

            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-[#8ea7c5]">
              Ceritakan hal yang ingin kamu diskusikan dengan guru BK.
            </p>

            <textarea
              id="textarea-keluhan"
              rows={5}
              maxLength={MAX_CHAR}
              value={keluhan}
              onChange={(e) => {
                setKeluhan(e.target.value);
                setClientError(null);
              }}
              placeholder="Ceritakan apa yang sedang kamu alami..."
              required
              className="mt-3 min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f4c542] focus:ring-2 focus:ring-[#f4c542]/50 dark:border-[#1c385c] dark:bg-[#071526] dark:text-white dark:placeholder:text-slate-500"
            />

            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-[#8ea7c5]">
                Maksimal {MAX_CHAR} karakter
              </span>

              <span
                className={`shrink-0 text-xs font-semibold ${
                  keluhan.length >= MAX_CHAR
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
                aria-live="polite"
              >
                {keluhan.length}/{MAX_CHAR}
              </span>
            </div>
          </div>

          {/* Informasi */}
          <div className="mt-6 flex min-w-0 items-start gap-3 rounded-2xl border border-amber-200/70 bg-[#faf7f0] p-4 dark:border-[#1f3f63] dark:bg-[#122842]/60">
            <Lightbulb
              size={20}
              className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
            />

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Sebelum mengirim
              </p>

              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6]">
                Pengajuan akan menunggu persetujuan guru BK. Pastikan tanggal,
                jam, dan informasi yang kamu tulis sudah benar.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/siswa/konseling"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-[#a0b3c6] dark:hover:bg-[#112946] dark:hover:text-white sm:justify-start"
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#071c38] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0d2a52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#f4c542] dark:text-[#071c38] dark:hover:bg-[#eab308] sm:w-auto sm:rounded-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim pengajuan
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}