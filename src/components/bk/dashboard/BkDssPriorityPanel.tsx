
"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  UsersRound,
} from "lucide-react";
import { BkViolationStudentItem } from "@/hooks/useBkDashboardData";

interface BkDssPriorityPanelProps {
  violationStudents: BkViolationStudentItem[];
  criticalStudentsCount: number;
  isLoading?: boolean;
}

export function BkDssPriorityPanel({
  violationStudents,
  criticalStudentsCount,
  isLoading = false,
}: BkDssPriorityPanelProps) {
  const prioritizedStudents = [...violationStudents]
    .filter((student) => student.totalPoin >= 25 || student.statusKritis)
    .sort((a, b) => b.totalPoin - a.totalPoin);

  const getPriorityBadge = (totalPoin: number) => {
    if (totalPoin >= 100) {
      return {
        label: "Sanksi Maksimal",
        range: "≥ 100 poin",
        className:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    }

    if (totalPoin >= 75) {
      return {
        label: "Peringatan Terakhir",
        range: "75–99 poin",
        className:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
      };
    }

    if (totalPoin >= 50) {
      return {
        label: "Peringatan 2",
        range: "50–74 poin",
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
      };
    }

    return {
      label: "Peringatan 1",
      range: "25–49 poin",
      className:
        "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
    };
  };

  return (
    <section
      aria-labelledby="dss-priority-heading"
      className="
        flex h-full min-w-0 flex-col
        rounded-2xl border border-slate-200 bg-white
        p-4 shadow-sm transition-colors
        dark:border-[#203a57] dark:bg-[#0d2138]
        sm:rounded-[20px] sm:p-5
        xl:p-6
      "
    >
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex h-10 w-10 shrink-0 items-center justify-center
              rounded-xl border border-slate-200 bg-slate-50
              text-[#0b2552]
              dark:border-[#29435f] dark:bg-[#102943] dark:text-yellow-300
            "
            aria-hidden="true"
          >
            <BarChart3 size={19} strokeWidth={2} />
          </div>

          <div className="min-w-0 pt-0.5">
            <h3
              id="dss-priority-heading"
              className="text-base font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Rekap & DSS
            </h3>

            <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Prioritas tindak lanjut berdasarkan poin pelanggaran siswa.
            </p>
          </div>
        </div>

        <div
          className="
            inline-flex w-full items-center gap-2 self-start
            rounded-xl border border-blue-200 bg-blue-50
            px-3 py-2 text-xs font-semibold text-blue-800
            sm:w-auto sm:max-w-[230px]
            dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200
          "
        >
          <UsersRound size={16} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0 leading-relaxed">
            <span className="font-bold tabular-nums">
              {criticalStudentsCount}
            </span>{" "}
            siswa perlu tindak lanjut
          </span>
        </div>
      </header>

      {/* Student priority list */}
      <div className="mt-5 flex-1 space-y-3">
        {isLoading ? (
          <div
            className="space-y-3"
            aria-label="Memuat data prioritas siswa"
            aria-busy="true"
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  flex min-h-[76px] items-center gap-3 rounded-xl
                  border border-slate-100 bg-slate-50/70 p-3
                  dark:border-[#203a57] dark:bg-[#091b2e]
                "
              >
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>

                <div className="h-6 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
          </div>
        ) : prioritizedStudents.length === 0 ? (
          <div
            className="
              flex min-h-[190px] flex-col items-center justify-center
              rounded-xl border border-dashed border-slate-200
              bg-slate-50/60 px-5 py-8 text-center
              dark:border-[#29435f] dark:bg-[#091b2e]/70
            "
          >
            <div
              className="
                flex h-11 w-11 items-center justify-center rounded-full
                bg-emerald-50 text-emerald-600
                dark:bg-emerald-950/50 dark:text-emerald-400
              "
            >
              <CheckCircle2 size={23} />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-white">
              Belum ada siswa dalam daftar prioritas
            </p>

            <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Tidak ditemukan siswa dengan poin minimal 25 pada data yang
              tersedia.
            </p>
          </div>
        ) : (
          prioritizedStudents.slice(0, 3).map((student, index) => {
            const badge = getPriorityBadge(student.totalPoin);

            return (
              <article
                key={student.id}
                className="
                  grid grid-cols-[32px_minmax(0,1fr)] items-center gap-x-3 gap-y-3
                  rounded-xl border border-slate-200 bg-white p-3
                  transition-colors
                  hover:border-slate-300 hover:bg-slate-50/70
                  sm:grid-cols-[32px_minmax(0,1fr)_auto]
                  sm:gap-3 sm:p-3.5
                  dark:border-[#203a57] dark:bg-[#091b2e]
                  dark:hover:border-[#365474] dark:hover:bg-[#10243a]
                "
              >
                <span
                  className="
                    flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-lg bg-[#0b2552] text-xs font-bold text-white
                    dark:bg-[#17385c] dark:text-yellow-300
                  "
                  aria-label={`Prioritas ${index + 1}`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 self-center">
                  <p
                    className="truncate text-sm font-bold text-slate-900 dark:text-white"
                    title={student.nama || "Siswa"}
                  >
                    {student.nama || "Siswa"}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    Rombel: {student.rombel || "-"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Akumulasi{" "}
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {student.totalPoin} poin
                    </span>
                    <span className="mx-1 text-slate-300 dark:text-slate-600">
                      ·
                    </span>
                    {student.jumlahKasus} catatan
                  </p>
                </div>

                <div className="col-start-2 flex min-w-0 flex-wrap items-center gap-2 sm:col-start-auto sm:flex-col sm:items-end sm:justify-center">
                  <span
                    className={`
                      inline-flex max-w-full items-center justify-center
                      rounded-lg border px-2.5 py-1.5
                      text-[11px] font-bold leading-tight
                      ${badge.className}
                    `}
                  >
                    {badge.label}
                  </span>

                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-right">
                    {badge.range}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* DSS explanation */}
      <aside
        className="
          mt-4 flex items-start gap-2.5 rounded-xl
          border border-slate-200 bg-slate-50 p-3.5
          dark:border-[#203a57] dark:bg-[#091b2e]
        "
      >
        <ShieldAlert
          size={17}
          className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />

        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          Daftar diurutkan berdasarkan akumulasi poin tertinggi. Ambang
          peringatan harus mengikuti tata tertib resmi sekolah. Hasil ini
          merupakan alat bantu pengambilan keputusan; keputusan pembinaan
          tetap berada pada Guru BK.
        </p>
      </aside>

      {/* Footer */}
      <footer className="mt-5 border-t border-slate-100 pt-4 dark:border-[#203a57]">
        <Link
          href="/bk/rekap"
          className="
            group inline-flex min-h-9 w-full items-center justify-between
            gap-3 rounded-lg text-sm font-bold
            text-[#0b2552] transition-colors
            hover:text-blue-700
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-blue-500 focus-visible:ring-offset-2
            dark:text-yellow-300 dark:hover:text-yellow-200
            dark:focus-visible:ring-offset-[#0d2138]
          "
        >
          <span>Lihat Rekap & DSS</span>

          <span
            className="
              flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
              bg-slate-100 transition-transform duration-200
              group-hover:translate-x-0.5
              dark:bg-[#17314d]
            "
          >
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>
      </footer>
    </section>
  );
}
