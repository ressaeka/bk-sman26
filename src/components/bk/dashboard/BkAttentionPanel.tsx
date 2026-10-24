"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ArrowRight,
  MessageSquare,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  BkCounselingItem,
  BkScheduleItem,
  BkAssessmentRekap,
  BkViolationStudentItem,
} from "@/hooks/useBkDashboardData";
import { AlertCircle, RefreshCw } from "lucide-react";

interface BkAttentionPanelProps {
  konselingList: BkCounselingItem[];
  schedules: BkScheduleItem[];
  rekapAssessment?: BkAssessmentRekap | null;
  pendingAngketReviewCount?: number;
  violationStudents: BkViolationStudentItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

type FilterTab = "SEMUA" | "KONSELING" | "ASESMEN" | "TINDAK_LANJUT";

export function BkAttentionPanel({
  konselingList,
  schedules,
  rekapAssessment,
  pendingAngketReviewCount: propPendingAngketCount,
  violationStudents,
  isLoading = false,
  error = null,
  onRetry,
}: BkAttentionPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("SEMUA");

  // 1. Pengajuan konseling PENDING
  const pendingCounseling = konselingList.filter((k) => k.status === "PENDING");

  // 2. Asesmen Perlu Ditinjau (Angket Masalah PENDING review dari backend atau fallback)
  const pendingAngketCount =
    propPendingAngketCount ??
    rekapAssessment?.siswa?.filter(
      (s) => s.angketMasalah?.sudah && s.angketMasalah?.statusReview === "PENDING"
    ).length ?? 0;
  const activeSchedules = schedules.filter((s) => s.isActive);
  const totalAssessmentAttention = (pendingAngketCount > 0 ? 1 : 0) + activeSchedules.length;

  // 3. Siswa tindak lanjut pelanggaran (Poin >= 25 atau status kritis)
  const criticalViolations = violationStudents.filter(
    (s) => s.statusKritis || s.totalPoin >= 25
  );

  const counts = {
    SEMUA: pendingCounseling.length + totalAssessmentAttention + criticalViolations.length,
    KONSELING: pendingCounseling.length,
    ASESMEN: totalAssessmentAttention,
    TINDAK_LANJUT: criticalViolations.length,
  };

  const tabOptions: Array<{ key: FilterTab; label: string; count: number }> = [
    { key: "SEMUA", label: "Semua", count: counts.SEMUA },
    { key: "KONSELING", label: "Konseling", count: counts.KONSELING },
    { key: "ASESMEN", label: "Asesmen", count: counts.ASESMEN },
    { key: "TINDAK_LANJUT", label: "Tindak Lanjut", count: counts.TINDAK_LANJUT },
  ];

  return (
    <section
      aria-labelledby="attention-panel-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4.5 shadow-sm transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER PANEL & FILTER TABS (Urut dari yang paling mendesak) */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fef6da] text-[#b85b08] dark:bg-[#2e2712] dark:text-[#fcd34d]"
              aria-hidden="true"
            >
              <Bell size={18} />
            </div>
            <div>
              <h3
                id="attention-panel-heading"
                className="text-[15px] font-bold text-[#071a3a] dark:text-white sm:text-[16px]"
              >
                Perlu Perhatian
              </h3>
              <p className="text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
                Urut dari yang paling mendesak
              </p>
            </div>
          </div>

          {/* TAB FILTER (Horizontal scroll di mobile, tap target >= 36px) */}
          <div
            role="tablist"
            aria-label="Filter kategori perhatian"
            className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-1 text-[12px] font-semibold text-[#5b6b85] scrollbar-none dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf]"
          >
            {tabOptions.map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex min-h-[34px] items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] ${
                    isSelected
                      ? "bg-[#f4c542] font-bold text-[#071a3a] shadow-xs"
                      : "hover:text-[#071a3a] dark:hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10.5px] font-bold ${
                      isSelected
                        ? "bg-[#071a3a] text-white"
                        : "bg-slate-200 text-[#071a3a] dark:bg-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error && !isLoading && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-[12px] text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-red-700"
              >
                <RefreshCw size={11} />
                <span>Coba Lagi</span>
              </button>
            )}
          </div>
        )}

        {/* 3 KOLOM SUB-KARTU SESUAI SCREENSHOT MOCKUP */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {/* ======================================================== */}
          {/* KOLOM 1: PENGAJUAN KONSELING                              */}
          {/* ======================================================== */}
          {(activeTab === "SEMUA" || activeTab === "KONSELING") && (
            <div className="flex flex-col justify-between rounded-2xl border border-[#e6ebf3] bg-[#fcfdfe] p-4 transition-colors dark:border-[#173456] dark:bg-[#071526]">
              <div>
                <div className="flex items-center justify-between border-b border-[#f5f8fc] pb-3 dark:border-[#132c4a]">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#b85b08] dark:text-[#f4c542]" />
                    <h4 className="text-[13.5px] font-bold text-[#071a3a] dark:text-white">
                      Pengajuan Konseling
                    </h4>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fef6da] text-[11px] font-extrabold text-[#b85b08] dark:bg-[#2e2712] dark:text-[#fcd34d]">
                    {pendingCounseling.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {isLoading ? (
                    <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                  ) : pendingCounseling.length === 0 ? (
                    <p className="py-6 text-center text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
                      Tidak ada permohonan konseling baru yang menunggu respons.
                    </p>
                  ) : (
                    pendingCounseling.slice(0, 3).map((k) => (
                      <div
                        key={k.id}
                        className="rounded-xl border border-[#e6ebf3] bg-white p-3 transition-colors dark:border-[#173456] dark:bg-[#0d2138]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md border border-[#f4c542]/40 bg-[#fef6da] px-2 py-0.5 text-[10.5px] font-bold text-[#b85b08] dark:bg-[#2e2712] dark:border-[#524318] dark:text-[#fcd34d]">
                            Menunggu
                          </span>
                          <span className="text-[10.5px] text-[#5b6b85] dark:text-[#829dbf]">
                            {k.tanggal} · {k.jam}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] font-bold text-[#071a3a] dark:text-white line-clamp-1">
                          {k.siswa?.nama_siswa || "Siswa"} — {k.siswa?.rombel || "-"}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#5b6b85] dark:text-[#829dbf] line-clamp-1">
                          {k.topik || "Konsultasi Bimbingan"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f8fc] dark:border-[#163863]">
                <Link
                  href="/bk/konseling"
                  className="group inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] dark:text-[#f4c542] dark:hover:text-[#ffd66b]"
                >
                  <span>Proses pengajuan</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* KOLOM 2: ASESMEN PERLU DITINJAU                          */}
          {/* ======================================================== */}
          {(activeTab === "SEMUA" || activeTab === "ASESMEN") && (
            <div className="flex flex-col justify-between rounded-2xl border border-[#e6ebf3] bg-[#fcfdfe] p-4 transition-colors dark:border-[#173456] dark:bg-[#071526]">
              <div>
                <div className="flex items-center justify-between border-b border-[#f5f8fc] pb-3 dark:border-[#132c4a]">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#1d4ed8] dark:text-[#8fb4dc]" />
                    <h4 className="text-[13.5px] font-bold text-[#071a3a] dark:text-white">
                      Asesmen Perlu Ditinjau
                    </h4>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eff6ff] text-[11px] font-extrabold text-[#1d4ed8] dark:bg-[#143356] dark:text-[#8fb4dc]">
                    {totalAssessmentAttention}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {isLoading ? (
                    <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                  ) : totalAssessmentAttention === 0 ? (
                    <p className="py-6 text-center text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
                      Seluruh hasil asesmen siswa telah ditinjau dengan lengkap.
                    </p>
                  ) : (
                    <>
                      {/* Item Angket Masalah Pending Review */}
                      {pendingAngketCount > 0 && (
                        <div className="rounded-xl border border-[#e6ebf3] bg-white p-3 transition-colors dark:border-[#173456] dark:bg-[#0d2138]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[10.5px] font-bold text-[#1d4ed8] dark:bg-[#143356] dark:border-[#1d416b] dark:text-[#8fb4dc]">
                              Angket Masalah
                            </span>
                            <span className="text-[10.5px] font-medium text-[#107a55] dark:text-[#34d399]">
                              Siap ditinjau
                            </span>
                          </div>
                          <p className="mt-1.5 text-[13px] font-bold text-[#071a3a] dark:text-white line-clamp-1">
                            {pendingAngketCount} Berkas Menunggu Review
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[#5b6b85] dark:text-[#829dbf] line-clamp-1">
                            Perlu verifikasi catatan Guru BK
                          </p>
                        </div>
                      )}

                      {/* Item Jadwal Asesmen Aktif */}
                      {activeSchedules.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="rounded-xl border border-[#e6ebf3] bg-white p-3 transition-colors dark:border-[#173456] dark:bg-[#0d2138]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-0.5 text-[10.5px] font-bold text-[#107a55] dark:bg-[#0d332e] dark:border-[#155449] dark:text-[#34d399]">
                              {s.tipe.replace("_", " ")}
                            </span>
                            <span className="text-[10.5px] text-[#5b6b85] dark:text-[#829dbf]">
                              Jadwal Aktif
                            </span>
                          </div>
                          <p className="mt-1.5 text-[13px] font-bold text-[#071a3a] dark:text-white line-clamp-1">
                            {s.judul}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-[#5b6b85] dark:text-[#829dbf] line-clamp-1">
                            Target: {s.targetRombel || s.targetTingkat || "Semua Tingkat"}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f8fc] dark:border-[#163863]">
                <Link
                  href="/bk/jadwal-asesmen"
                  className="group inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] dark:text-[#f4c542] dark:hover:text-[#ffd66b]"
                >
                  <span>Lihat jadwal asesmen</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* KOLOM 3: TINDAK LANJUT PELANGGARAN                        */}
          {/* ======================================================== */}
          {(activeTab === "SEMUA" || activeTab === "TINDAK_LANJUT") && (
            <div className="flex flex-col justify-between rounded-2xl border border-[#e6ebf3] bg-[#fcfdfe] p-4 transition-colors dark:border-[#173456] dark:bg-[#071526] md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between border-b border-[#f5f8fc] pb-3 dark:border-[#132c4a]">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#b85b08] dark:text-amber-400" />
                    <h4 className="text-[13.5px] font-bold text-[#071a3a] dark:text-white">
                      Tindak Lanjut Pelanggaran
                    </h4>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff7ed] text-[11px] font-extrabold text-[#b85b08] dark:bg-amber-950/70 dark:text-amber-400">
                    {criticalViolations.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  {isLoading ? (
                    <div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
                  ) : criticalViolations.length === 0 ? (
                    <p className="py-6 text-center text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
                      Tidak ada siswa dalam ambang batas peringatan sanksi (&ge; 25 poin).
                    </p>
                  ) : (
                    criticalViolations.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-[#e6ebf3] bg-white p-3 transition-colors dark:border-[#173456] dark:bg-[#0d2138]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold ${
                              s.totalPoin >= 75
                                ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:border-red-800 dark:text-red-300"
                                : s.totalPoin >= 50
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300"
                                : "bg-[#fef6da] text-[#b85b08] border border-[#f4c542]/40 dark:bg-[#2e2712] dark:border-[#524318] dark:text-[#fcd34d]"
                            }`}
                          >
                            Poin {s.totalPoin}
                          </span>
                          <span className="text-[10.5px] text-[#5b6b85] dark:text-[#829dbf]">
                            {s.statusSanksi.split("(")[0].trim()}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] font-bold text-[#071a3a] dark:text-white line-clamp-1">
                          {s.nama || "Siswa"} — {s.rombel || "-"}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-[#5b6b85] dark:text-[#829dbf] line-clamp-1">
                          {s.tindakan[0] || "Perlu pembinaan lanjutan dari Guru BK"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f8fc] dark:border-[#163863]">
                <Link
                  href="/bk/pelanggaran"
                  className="group inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0b2552] transition-colors hover:text-[#071a3a] dark:text-[#f4c542] dark:hover:text-[#ffd66b]"
                >
                  <span>Lihat daftar siswa</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
