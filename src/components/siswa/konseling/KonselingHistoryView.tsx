
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  KonselingItem,
  getTopikMeta,
  formatIndonesianDate,
  getStatusDisplay,
} from "./KonselingTypes";
import { STATUS_KONSELING } from "@/constants/konseling.constant";

interface KonselingHistoryViewProps {
  sessions: KonselingItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

type FilterStatus =
  | "SEMUA"
  | "PENDING"
  | "DISETUJUI"
  | "DITOLAK"
  | "SELESAI";

export function KonselingHistoryView({
  sessions,
  isLoading,
  error,
  onRetry,
}: KonselingHistoryViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("SEMUA");

  const counts = useMemo(
    () => ({
      pending: sessions.filter(
        (item) => item.status === STATUS_KONSELING.PENDING
      ).length,
      disetujui: sessions.filter(
        (item) => item.status === STATUS_KONSELING.DISETUJUI
      ).length,
      ditolak: sessions.filter(
        (item) => item.status === STATUS_KONSELING.DITOLAK
      ).length,
      selesai: sessions.filter(
        (item) => item.status === STATUS_KONSELING.SELESAI
      ).length,
    }),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    if (activeFilter === "SEMUA") return sessions;

    return sessions.filter((session) => session.status === activeFilter);
  }, [sessions, activeFilter]);

  const filterTabs: { id: FilterStatus; label: string }[] = [
    { id: "SEMUA", label: "Semua" },
    { id: "PENDING", label: "Menunggu" },
    { id: "DISETUJUI", label: "Disetujui" },
    { id: "DITOLAK", label: "Ditolak" },
    { id: "SELESAI", label: "Selesai" },
  ];

  const summaryCards = [
    {
      label: "Menunggu",
      count: counts.pending,
      color: "bg-amber-500",
    },
    {
      label: "Disetujui",
      count: counts.disetujui,
      color: "bg-blue-500",
    },
    {
      label: "Ditolak",
      count: counts.ditolak,
      color: "bg-red-500",
    },
    {
      label: "Selesai",
      count: counts.selesai,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-clip sm:space-y-6">
      {/* Header */}
      <header className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#071c38] dark:text-white sm:text-3xl">
            Konseling
          </h1>

          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6] sm:text-base">
            Ajukan dan pantau sesi konseling dengan guru BK.
          </p>
        </div>

        <Link
          href="/siswa/konseling/ajukan"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#f4c542] px-5 py-3 text-sm font-bold text-[#071c38] shadow-sm transition hover:bg-[#eab308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 active:scale-[0.99] sm:w-auto sm:rounded-full"
        >
          <Plus size={18} strokeWidth={2.8} />
          <span>Ajukan Konseling</span>
        </Link>
      </header>

      {/* Total pengajuan */}
      <section
        aria-label="Total pengajuan konseling"
        className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 dark:border-[#173456] dark:bg-[#0c1f36] sm:px-5"
      >
        <p className="text-sm text-slate-600 dark:text-[#a0b3c6]">
          Total pengajuan
        </p>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xl font-extrabold text-[#071c38] dark:text-white sm:text-2xl">
          <span className="tabular-nums">
            {isLoading ? "—" : sessions.length}
          </span>

          <span className="text-sm font-medium text-slate-500 dark:text-[#8ea7c5]">
            pengajuan konseling
          </span>
        </p>
      </section>

      {/* Ringkasan status */}
      <section
        aria-label="Ringkasan status pengajuan"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-5"
          >
            <p className="text-2xl font-extrabold tabular-nums text-[#071c38] dark:text-white sm:text-4xl">
              {isLoading ? "—" : card.count}
            </p>

            <div className="mt-2 flex min-w-0 items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${card.color}`}
                aria-hidden="true"
              />

              <span className="min-w-0 break-words text-xs font-semibold text-slate-600 dark:text-[#a0b3c6] sm:text-sm">
                {card.label}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Filter status */}
      <section
        aria-label="Filter status konseling"
        className="min-w-0"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Filter status
          </h2>
        </div>

        <div
          className="-mx-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="flex w-max min-w-full gap-2 sm:w-full sm:flex-wrap">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-[#071c38] bg-[#071c38] text-white shadow-sm dark:border-[#f4c542] dark:bg-[#f4c542] dark:text-[#071c38]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-[#173456] dark:bg-[#0c1f36] dark:text-[#a0b3c6] dark:hover:bg-[#112946]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Loading */}
      {isLoading ? (
        <div
          className="space-y-3"
          aria-label="Memuat riwayat konseling"
          aria-busy="true"
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-5"
            >
              <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 sm:h-14 sm:w-14 sm:rounded-2xl" />

              <div className="min-w-0 flex-1 space-y-3 py-1">
                <div className="h-4 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error */
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-900/60 dark:bg-red-950/30 sm:p-8"
        >
          <AlertCircle
            className="mx-auto h-10 w-10 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />

          <h2 className="mt-3 text-base font-bold text-red-900 dark:text-red-300">
            Gagal memuat riwayat konseling
          </h2>

          <p className="mx-auto mt-2 max-w-md break-words text-sm leading-relaxed text-red-700 dark:text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Coba lagi
          </button>
        </div>
      ) : filteredSessions.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-9 text-center dark:border-slate-700 dark:bg-[#0c1f36]/50 sm:rounded-3xl sm:px-8 sm:py-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <Sparkles size={26} aria-hidden="true" />
          </div>

          <h2 className="mt-4 break-words text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            {activeFilter === "SEMUA"
              ? "Belum ada pengajuan konseling"
              : `Tidak ada pengajuan ${
                  filterTabs
                    .find((tab) => tab.id === activeFilter)
                    ?.label.toLowerCase() ?? ""
                }`}
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-[#a0b3c6]">
            {activeFilter === "SEMUA"
              ? "Kamu bisa mengajukan konseling untuk membicarakan masalah belajar, pribadi, karier, atau sosial."
              : "Coba pilih filter status lainnya untuk melihat pengajuanmu."}
          </p>

          {activeFilter === "SEMUA" && (
            <Link
              href="/siswa/konseling/ajukan"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#f4c542] px-5 py-3 text-sm font-bold text-[#071c38] transition hover:bg-[#eab308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 sm:w-auto"
            >
              <Plus size={17} aria-hidden="true" />
              Ajukan konseling
            </Link>
          )}
        </div>
      ) : (
        /* Daftar sesi konseling */
        <div className="space-y-3">
          {filteredSessions.map((item) => {
            const meta = getTopikMeta(item.topik);
            const statusDisplay = getStatusDisplay(item);
            const Icon = meta.icon;

            return (
              <Link
                key={item.id}
                href={`/siswa/konseling/${item.id}`}
                className="group block min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:border-[#173456] dark:bg-[#0c1f36] dark:hover:border-amber-500/50 sm:rounded-3xl sm:p-5"
              >
                {/* Topik */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4c542] text-[#071c38] transition group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon
                      size={23}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <h2 className="min-w-0 break-words text-base font-bold text-slate-900 transition group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-400 sm:text-lg">
                        {item.topik}
                      </h2>

                      <ChevronRight
                        size={18}
                        className="mt-0.5 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-amber-500"
                        aria-hidden="true"
                      />
                    </div>

                    {item.keluhan && (
                      <p className="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6]">
                        {item.keluhan}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata dan status */}
                <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
                  <div className="min-w-0 space-y-2 text-xs font-medium text-slate-500 dark:text-[#8ea7c5] sm:text-sm">
                    <div className="flex min-w-0 items-start gap-2">
                      <Calendar
                        size={15}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />

                      <span className="break-words">
                        {formatIndonesianDate(item.tanggal, true)}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-start gap-2">
                      <Clock
                        size={15}
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                      />

                      <span className="break-words">
                        {item.jam.replace(/\s*wib\s*/gi, "").trim()} WIB
                      </span>
                    </div>

                    {item.counselor?.nama && (
                      <p className="break-words pl-[23px] font-semibold text-slate-700 dark:text-slate-300">
                        {item.counselor.nama}
                      </p>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:flex-col sm:items-end">
                    <span
                      className={`inline-flex max-w-full shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${statusDisplay.badgeClass}`}
                    >
                      {statusDisplay.label}
                    </span>

                    <span className="break-words text-[11px] text-slate-400 dark:text-[#7187a1] sm:text-right">
                      Diajukan{" "}
                      {formatIndonesianDate(item.createdAt, false)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
