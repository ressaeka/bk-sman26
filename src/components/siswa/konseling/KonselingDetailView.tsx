"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Sparkles,
  Lightbulb,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  KonselingItem,
  getTopikMeta,
  formatIndonesianDate,
  getStatusDisplay,
} from "./KonselingTypes";
import { STATUS_KONSELING } from "@/constants/konseling.constant";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";

interface KonselingDetailViewProps {
  initialSession: KonselingItem;
}

export function KonselingDetailView({
  initialSession,
}: KonselingDetailViewProps) {
  const router = useRouter();
  const { patch } = useApiClient();

  const [session, setSession] = useState<KonselingItem>(initialSession);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const meta = getTopikMeta(session.topik);
  const statusDisplay = getStatusDisplay(session);
  const Icon = meta.icon;

  const sessionDateStr = formatIndonesianDate(session.tanggal, true);
  const appliedDateStr = formatIndonesianDate(session.createdAt, false);
  const updatedDateStr = formatIndonesianDate(session.updatedAt, false);

  const isPending = session.status === STATUS_KONSELING.PENDING;
  const isApproved = session.status === STATUS_KONSELING.DISETUJUI;
  const isRejected = session.status === STATUS_KONSELING.DITOLAK;
  const isCompleted = session.status === STATUS_KONSELING.SELESAI;

  const isCancelled = statusDisplay.isCancelledByStudent;

  const handleCancelSession = async () => {
    if (isCancelling || !isPending) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const response = await patch<KonselingItem>(
        `/api/siswa/konseling/${session.id}/batal`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Gagal membatalkan pengajuan konseling."
        );
      }

      setSession(response.data);
      setIsConfirmOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setCancelError(formatErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const infoCards = [
    {
      label: "Tanggal",
      value: sessionDateStr,
      icon: Calendar,
    },
    {
      label: "Jam",
      value: `${session.jam.replace(/wib/gi, "").trim()} WIB`,
      icon: Clock,
    },
    {
      label: "Guru BK",
      value: session.counselor?.nama || "Menunggu penugasan Guru BK",
      icon: User,
    },
    {
      label: "Tempat",
      value: "Ruang BK",
      icon: MapPin,
    },
  ];

  const steps = [
    {
      title: "Diajukan",
      description: appliedDateStr,
      complete: true,
      rejected: false,
    },
    {
      title: "Ditinjau",
      description: isPending ? "Sedang ditinjau" : updatedDateStr,
      complete: !isPending,
      rejected: false,
    },
    {
      title: isCancelled ? "Dibatalkan" : isRejected ? "Ditolak" : "Disetujui",
      description:
        isApproved || isCompleted || isRejected ? updatedDateStr : "Menunggu",
      complete: isApproved || isCompleted,
      rejected: isRejected,
    },
    {
      title: "Selesai",
      description: isCompleted ? updatedDateStr : "Menunggu sesi",
      complete: isCompleted,
      rejected: false,
    },
  ];

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-clip sm:space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#071c38] dark:text-white sm:text-3xl">
          Detail Konseling
        </h1>

        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6] sm:text-base">
          Pantau status dan jadwal sesi konselingmu.
        </p>
      </header>

      {/* Hero */}
      <section className="relative min-w-0 overflow-hidden rounded-2xl bg-[#071c38] p-5 text-white shadow-lg sm:rounded-3xl sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl sm:h-48 sm:w-48"
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 sm:text-sm">
            <Sparkles size={15} />
            Status pengajuan
          </div>

          <div className="mt-4 flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f4c542] text-[#071c38] sm:h-14 sm:w-14">
                <Icon size={26} strokeWidth={2.4} />
              </div>

              <h2 className="min-w-0 break-words text-xl font-extrabold tracking-tight sm:text-3xl">
                {session.topik}
              </h2>
            </div>

            <span
              className={`inline-flex max-w-full items-center rounded-full px-4 py-2 text-xs font-bold sm:text-sm ${statusDisplay.badgeClass}`}
            >
              {statusDisplay.label}
            </span>
          </div>

          {session.keluhan && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200 sm:text-base">
                {session.keluhan}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Jadwal */}
      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-7">
        <h2 className="text-lg font-bold text-[#071c38] dark:text-white sm:text-xl">
          Jadwal sesi
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4">
          {infoCards.map((card) => {
            const CardIcon = card.icon;

            return (
              <div
                key={card.label}
                className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-[#071526]/80 sm:p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-[#10243d] dark:text-amber-400">
                  <CardIcon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 dark:text-[#8ea7c5]">
                    {card.label}
                  </p>

                  <p className="mt-1 break-words text-sm font-bold leading-relaxed text-slate-900 dark:text-white sm:text-base">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Progress */}
      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-7">
        <h2 className="text-lg font-bold text-[#071c38] dark:text-white sm:text-xl">
          Progres pengajuan
        </h2>

        {/* Timeline vertikal pada mobile */}
        <div className="mt-6 space-y-0 sm:hidden">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={step.title} className="flex gap-3">
                <div className="flex w-10 shrink-0 flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      step.rejected
                        ? "bg-red-500 text-white"
                        : step.complete
                          ? index === 3
                            ? "bg-emerald-500 text-white"
                            : "bg-[#f4c542] text-[#071c38]"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {step.rejected ? (
                      <X size={17} strokeWidth={3} />
                    ) : step.complete ? (
                      <Check size={17} strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>

                  {!isLast && (
                    <div
                      className={`my-1 min-h-8 w-0.5 ${
                        step.complete
                          ? "bg-amber-400"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1 pb-5">
                  <p className="break-words text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </p>

                  <p className="mt-1 break-words text-xs leading-relaxed text-slate-500 dark:text-[#8ea7c5]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline horizontal pada tablet/desktop */}
        <div className="mt-8 hidden sm:block">
          <div className="relative grid grid-cols-4 gap-2">
            <div
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-[18px] h-1 rounded-full bg-slate-200 dark:bg-[#193557]"
            />

            <div
              aria-hidden="true"
              className={`absolute left-[12.5%] top-[18px] h-1 rounded-full transition-all ${
                isCompleted
                  ? "w-[75%] bg-emerald-500"
                  : isApproved
                    ? "w-[50%] bg-amber-400"
                    : isRejected
                      ? "w-[50%] bg-red-400"
                      : isPending
                        ? "w-0"
                        : "w-0"
              }`}
            />

            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative z-10 flex min-w-0 flex-col items-center text-center"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#0c1f36] ${
                    step.rejected
                      ? "bg-red-500 text-white"
                      : step.complete
                        ? index === 3
                          ? "bg-emerald-500 text-white"
                          : "bg-[#f4c542] text-[#071c38]"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {step.rejected ? (
                    <X size={17} strokeWidth={3} />
                  ) : step.complete ? (
                    <Check size={17} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>

                <p className="mt-3 break-words text-sm font-bold text-slate-900 dark:text-white">
                  {step.title}
                </p>

                <p className="mt-1 max-w-full break-words text-xs leading-relaxed text-slate-500 dark:text-[#8ea7c5]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catatan Guru BK */}
      {session.catatanGuruBK && (
        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-[#173456] dark:bg-[#0c1f36] sm:rounded-3xl sm:p-7">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />

            <h2 className="text-lg font-bold text-[#071c38] dark:text-white sm:text-xl">
              Catatan guru BK
            </h2>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-slate-50 p-4 dark:bg-[#071526]/80 sm:rounded-2xl sm:p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800 dark:text-slate-200 sm:text-base">
              {session.catatanGuruBK}
            </p>

            <p className="mt-3 break-words text-xs font-semibold text-slate-500 dark:text-[#8ea7c5]">
              — {session.counselor?.nama || "Guru BK"} · {updatedDateStr}
            </p>
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/siswa/konseling"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0c1f36] dark:text-[#a0b3c6] dark:hover:bg-[#112946] dark:hover:text-white sm:justify-start"
        >
          <ArrowLeft size={17} />
          Kembali
        </Link>

        {isPending && (
          <button
            type="button"
            onClick={() => {
              setCancelError(null);
              setIsConfirmOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900/60 dark:bg-[#0c1f36] dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Batalkan pengajuan
          </button>
        )}
      </div>

      {/* Confirmation dialog */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cancel-title"
          aria-describedby="modal-cancel-description"
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCancelling) {
              setIsConfirmOpen(false);
              setCancelError(null);
            }
          }}
        >
          <div className="my-auto max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#173456] dark:bg-[#0c1f36] sm:max-w-md sm:rounded-3xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle size={24} />
            </div>

            <h2
              id="modal-cancel-title"
              className="mt-4 text-lg font-bold text-slate-900 dark:text-white"
            >
              Batalkan pengajuan konseling?
            </h2>

            <p
              id="modal-cancel-description"
              className="mt-2 break-words text-sm leading-relaxed text-slate-600 dark:text-[#a0b3c6]"
            >
              Apakah kamu yakin ingin membatalkan pengajuan konseling topik{" "}
              <strong>&quot;{session.topik}&quot;</strong> pada{" "}
              {sessionDateStr}? Tindakan ini tidak dapat dibatalkan.
            </p>

            {cancelError && (
              <div
                role="alert"
                className="mt-4 break-words rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
              >
                {cancelError}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => {
                  setIsConfirmOpen(false);
                  setCancelError(null);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Tidak, kembali
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelSession}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  "Ya, batalkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}