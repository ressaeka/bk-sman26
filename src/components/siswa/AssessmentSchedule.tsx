
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  RefreshCw,
  FileText,
  Sparkles,
  Compass,
  Info,
  CalendarClock,
  ClipboardList,
} from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";
import { StudentScheduleStatus } from "@/services/jadwal-asesmen.service";

export function AssessmentSchedule() {
  const { get } = useApiClient();
  const [schedules, setSchedules] = useState<StudentScheduleStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchSchedules() {
      try {
        const response = await get<StudentScheduleStatus[]>(
          "/api/siswa/assessment/jadwal"
        );

        if (!isMounted) return;

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Gagal memuat jadwal asesmen."
          );
        }

        setSchedules(response.data);
        setError(null);
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(formatErrorMessage(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchSchedules();

    return () => {
      isMounted = false;
    };
  }, [get, reloadKey]);

  const activeCount = schedules.filter(
    (item) => item.status === "SEDANG_BERLANGSUNG" && !item.isCompleted
  ).length;

  const completedCount = schedules.filter(
    (item) => item.isCompleted || item.status === "SUDAH_SELESAI"
  ).length;

  const renderIcon = (tipe: StudentScheduleStatus["tipe"]) => {
    const common = "h-5 w-5";

    switch (tipe) {
      case "ANGKET_MASALAH":
        return <FileText className={`${common} text-amber-600 dark:text-amber-400`} />;
      case "GAYA_BELAJAR":
        return <Sparkles className={`${common} text-violet-600 dark:text-violet-400`} />;
      case "MINAT_BAKAT":
        return <Compass className={`${common} text-purple-600 dark:text-purple-400`} />;
      default:
        return <CalendarDays className={`${common} text-slate-600 dark:text-slate-300`} />;
    }
  };

  const getStatusStyle = (status: StudentScheduleStatus["status"]) => {
    switch (status) {
      case "SUDAH_SELESAI":
        return {
          label: "Selesai",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500",
          icon: <CheckCircle2 size={13} />,
        };
      case "SEDANG_BERLANGSUNG":
        return {
          label: "Sedang berlangsung",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          dot: "bg-emerald-500",
          icon: <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />,
        };
      case "TERJADWAL":
        return {
          label: "Terjadwal",
          className:
            "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
          dot: "bg-sky-500",
          icon: <Clock3 size={13} />,
        };
      case "JADWAL_BERAKHIR":
        return {
          label: "Jadwal berakhir",
          className:
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
          dot: "bg-rose-500",
          icon: <LockKeyhole size={13} />,
        };
      default:
        return {
          label: "Menunggu jadwal BK",
          className:
            "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
          dot: "bg-slate-400",
          icon: <CalendarClock size={13} />,
        };
    }
  };

  return (
    <section
      aria-labelledby="assessment-schedule-title"
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-[#1c3857] dark:bg-[#0d2138] sm:rounded-3xl"
    >
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4 dark:border-[#1b3654] sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30">
              <CalendarDays className="h-5 w-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2
                id="assessment-schedule-title"
                className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg"
              >
                Jadwal Asesmen
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                Pantau jadwal dan progres asesmenmu.
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-[#294664] dark:bg-[#142e49] dark:text-slate-300 sm:text-xs">
            {isLoading ? "Memuat..." : `${schedules.length} asesmen`}
          </span>
        </div>

        {/* Summary */}
        {!isLoading && !error && schedules.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm dark:bg-emerald-950/60 dark:text-emerald-400">
                <ClipboardList size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none text-emerald-800 dark:text-emerald-300">
                  {activeCount}
                </p>
                <p className="mt-1 text-[11px] font-medium text-emerald-800/80 dark:text-emerald-300/80 sm:text-xs">
                  Bisa dikerjakan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-[#294664] dark:bg-[#112943]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm dark:bg-[#1a3856] dark:text-slate-300">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none text-slate-800 dark:text-white">
                  {completedCount}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 sm:text-xs">
                  Selesai
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="p-3 sm:p-5">
        {isLoading ? (
          <div
            className="space-y-3"
            role="status"
            aria-label="Memuat jadwal asesmen"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-3 rounded-xl border border-slate-200 p-4 dark:border-[#1c3857]"
              >
                <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
            <span className="sr-only">Sedang memuat data asesmen.</span>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60">
              <CircleAlert className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              Jadwal belum dapat dimuat
            </h3>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {error}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 dark:focus-visible:ring-offset-[#0d2138]"
            >
              <RefreshCw size={14} />
              Coba muat ulang
            </button>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-[#294664]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[#183451]">
              <CalendarDays className="h-6 w-6 text-slate-500 dark:text-slate-300" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              Belum ada jadwal asesmen
            </h3>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Jadwal akan ditampilkan di sini setelah Guru BK menetapkan waktu pelaksanaan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((item) => {
              const isCompleted =
                item.isCompleted || item.status === "SUDAH_SELESAI";
              const isActionable =
                item.status === "SEDANG_BERLANGSUNG" && !isCompleted;
              const status = getStatusStyle(item.status);

              return (
                <article
                  key={item.tipe}
                  className={`rounded-2xl border p-3.5 transition-colors sm:p-4 ${
                    isActionable
                      ? "border-amber-200 bg-amber-50/40 dark:border-amber-800/50 dark:bg-amber-950/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#203e5e] dark:bg-[#102640] dark:hover:border-[#315475]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-[#294664] dark:bg-[#183451]">
                      {renderIcon(item.tipe)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white sm:text-[15px]">
                          {item.nama}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold leading-none sm:text-[11px] ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.pesan}
                      </p>

                      {item.formattedWaktu && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-[#0c2035]">
                          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Waktu pelaksanaan
                            </p>
                            <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                              {item.formattedWaktu}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 border-t border-slate-100 pt-3 dark:border-[#203e5e]">
                        {isCompleted ? (
                          <Link
                            href={
                              item.tipe === "ANGKET_MASALAH"
                                ? item.url
                                : "/siswa/hasil-asesmen"
                            }
                            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:w-auto dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                          >
                            <CheckCircle2 size={15} />
                            Lihat hasil asesmen
                            <ArrowRight size={14} />
                          </Link>
                        ) : isActionable ? (
                          <Link
                            href={item.url}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f4c542] px-4 py-2.5 text-xs font-bold text-[#102238] shadow-sm transition hover:bg-[#e7b82e] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:w-auto dark:focus-visible:ring-offset-[#102640]"
                          >
                            Mulai asesmen
                            <ArrowRight size={15} />
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <LockKeyhole size={14} className="shrink-0" />
                            <span>
                              {item.status === "TERJADWAL"
                                ? "Akses terbuka saat waktu dimulai"
                                : item.status === "JADWAL_BERAKHIR"
                                  ? "Waktu pengerjaan telah berakhir"
                                  : "Menunggu informasi dari Guru BK"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Information banner */}
        {!isLoading && !error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-900/60 dark:bg-sky-950/20">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-400" />
            <p className="text-xs leading-relaxed text-sky-900 dark:text-sky-200">
              Asesmen hanya dapat dimulai saat jadwal resmi dibuka oleh Guru BK. Pastikan kamu menyelesaikannya sebelum waktu berakhir.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
