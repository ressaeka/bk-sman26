"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  LockKeyhole,
  Pin,
} from "lucide-react";

export interface AngketSubmittedData {
  id: number;
  statusReview: string;
  createdAt: string;
  reviewedAt?: string | null;
  counselor?: {
    nama: string;
  } | null;
}

interface AngketSubmittedViewProps {
  data: AngketSubmittedData;
}

const TIME_ZONE = "Asia/Jakarta";

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value: string): string {
  const date = parseDate(value);

  if (!date) return "Tanggal tidak tersedia";

  const formatted = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: TIME_ZONE,
  }).format(date);

  return `${formatted} WIB`;
}

function formatDateOnly(value?: string | null): string {
  const date = parseDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

function isReviewComplete(status: string): boolean {
  return status.trim().toUpperCase() === "DIREVIEW";
}

export function AngketSubmittedView({
  data,
}: AngketSubmittedViewProps) {
  const isReviewed = isReviewComplete(data.statusReview);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
      {/* Hero */}
      <section
        aria-labelledby="angket-submitted-title"
        className="relative isolate overflow-hidden rounded-2xl border border-[#143257] bg-[#071c38] p-5 text-white shadow-sm sm:rounded-[28px] sm:p-8 lg:p-9"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full bg-[#f4c542]/10 blur-3xl sm:h-64 sm:w-64"
        />

        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#f4c542] sm:text-sm">
          <span aria-hidden="true">✨</span>
          <span>Angket kamu</span>
        </div>

        <div className="mb-3 flex items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#a3e635] text-[#071c38] sm:h-12 sm:w-12 sm:rounded-2xl">
            <Check aria-hidden="true" size={25} strokeWidth={3} />
          </div>

          <h1
            id="angket-submitted-title"
            className="text-xl font-extrabold leading-tight tracking-tight text-[#f4c542] sm:text-3xl"
          >
            Berhasil dikirim
          </h1>
        </div>

        <p className="max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
          Terima kasih sudah jujur menyampaikan kondisimu. Jawabanmu
          telah tersimpan dan akan ditelaah oleh Guru BK.
        </p>
      </section>

      {/* Status dan timeline */}
      <section
        aria-labelledby="angket-status-title"
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-[#173456] dark:bg-[#0d2138] sm:space-y-8 sm:rounded-[28px] sm:p-7 lg:p-8"
      >
        <h2
          id="angket-status-title"
          className="text-base font-extrabold tracking-tight text-[#071c38] dark:text-white sm:text-lg"
        >
          Status angket
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {/* Waktu pengiriman */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#17385e] dark:bg-[#102742] sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#8ea7c5] sm:text-sm">
              <CalendarDays
                aria-hidden="true"
                size={16}
                className="shrink-0 text-[#b88716]"
              />
              <span>Waktu pengiriman</span>
            </div>

            <p className="mt-2 break-words text-sm font-bold leading-relaxed text-slate-900 dark:text-white sm:text-base">
              {formatDateTime(data.createdAt)}
            </p>
          </div>

          {/* Status telaah */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-[#17385e] dark:bg-[#102742] sm:rounded-2xl sm:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#8ea7c5] sm:text-sm">
              <Pin
                aria-hidden="true"
                size={16}
                className="shrink-0 text-[#b88716]"
              />
              <span>Status telaah</span>
            </div>

            <div className="mt-3">
              {isReviewed ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <CheckCircle2
                    aria-hidden="true"
                    size={14}
                    className="shrink-0"
                  />
                  <span>Selesai ditelaah</span>
                </span>
              ) : (
                <span className="inline-flex max-w-full items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold leading-relaxed text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  Menunggu telaah Guru BK
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-slate-100 pt-6 dark:border-[#173456] sm:pt-7">
          <div className="relative mx-auto flex w-full max-w-lg items-start justify-between">
            {/* Garis penghubung */}
            <div
              aria-hidden="true"
              className={[
                "absolute left-[18%] right-[18%] top-4 h-0.5",
                isReviewed
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-slate-700",
              ].join(" ")}
            />

            {/* Tahap 1 */}
            <div className="relative z-10 flex w-[42%] flex-col items-center text-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#071c38] text-white ring-4 ring-white dark:ring-[#0d2138]">
                <Check aria-hidden="true" size={16} strokeWidth={3} />
              </div>

              <span className="mt-3 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                Terkirim
              </span>

              <span className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-[#8ea7c5] sm:text-xs">
                {formatDateOnly(data.createdAt)}
              </span>
            </div>

            {/* Tahap 2 */}
            <div className="relative z-10 flex w-[42%] flex-col items-center text-center">
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white dark:ring-[#0d2138]",
                  isReviewed
                    ? "bg-emerald-600 text-white"
                    : "border-2 border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300",
                ].join(" ")}
              >
                {isReviewed ? (
                  <Check aria-hidden="true" size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">2</span>
                )}
              </div>

              <span className="mt-3 text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                Ditelaah Guru BK
              </span>

              <span className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-[#8ea7c5] sm:text-xs">
                {isReviewed
                  ? formatDateOnly(data.reviewedAt)
                  : "Menunggu"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Privasi */}
      <section
        aria-label="Informasi privasi"
        className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm leading-relaxed text-slate-700 dark:border-[#1a416e] dark:bg-[#102a49] dark:text-[#b5c8de] sm:gap-4 sm:p-5"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-[#252834] dark:text-[#f4c542]">
          <LockKeyhole aria-hidden="true" size={17} />
        </div>

        <p>
          <strong className="font-bold text-slate-900 dark:text-white">
            Hasil bersifat rahasia.
          </strong>{" "}
          Isi jawaban tidak ditampilkan pada halaman ini. Akses terhadap
          jawaban dibatasi sesuai kewenangan Guru BK. Jika memerlukan
          bantuan lebih lanjut, kamu dapat mengajukan konseling.
        </p>
      </section>

      {/* Tombol aksi */}
      <nav
        aria-label="Navigasi setelah pengisian angket"
        className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Link
          href="/siswa/konseling"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#f4c542] px-6 py-3 text-sm font-bold text-[#071526] shadow-sm transition-colors hover:bg-[#e2b435] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 active:scale-[0.99] sm:w-auto sm:rounded-2xl"
        >
          Ajukan Konseling
        </Link>

        <Link
          href="/siswa"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2 active:scale-[0.99] dark:border-[#173456] dark:bg-[#0d2138] dark:text-white dark:hover:bg-[#153457] sm:w-auto sm:rounded-2xl"
        >
          <ArrowLeft aria-hidden="true" size={17} strokeWidth={2.2} />
          <span>Kembali ke Dashboard</span>
        </Link>
      </nav>
    </div>
  );
}