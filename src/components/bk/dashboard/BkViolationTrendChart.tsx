"use client";

import React, { useId, useMemo, useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import type { MonthlyTrendBucket } from "@/services/dashboard.service";

/** Data harian untuk tampilan "Bulan Ini" (urut dari tanggal 1 ke hari ini). */
export interface DailyTrendBucket {
  dayKey: string;
  /** Contoh: "1", "2", ... "31" */
  dayLabel: string;
  count: number;
}

export const TREND_RANGES = [
  { value: "BULAN_INI", label: "Bulan Ini" },
  { value: "6_BULAN", label: "6 Bulan" },
  { value: "SETAHUN", label: "Setahun" },
] as const;

export type TrendRange = (typeof TREND_RANGES)[number]["value"];

interface BkViolationTrendChartProps {
  /**
   * Data bulanan, urut dari terlama ke terbaru.
   * Kirim minimal 12 bulan terakhir agar tampilan "Setahun" penuh.
   * Tampilan "6 Bulan" memotong 6 bulan terakhir secara otomatis.
   */
  monthlyData: MonthlyTrendBucket[];
  /** Data harian bulan berjalan. Dibutuhkan untuk tampilan "Bulan Ini". */
  dailyData?: DailyTrendBucket[];
  /** Rentang awal saat komponen pertama kali tampil. */
  defaultRange?: TrendRange;
  /** Dipanggil saat pengguna mengganti rentang (mis. untuk memuat data harian). */
  onRangeChange?: (range: TrendRange) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  /** @deprecated Ringkasan kini dihitung dari rentang yang sedang ditampilkan. */
  periodLabel?: string;
  /** @deprecated Ringkasan kini dihitung dari rentang yang sedang ditampilkan. */
  totalCases?: number;
  /** @deprecated Ringkasan kini dihitung dari rentang yang sedang ditampilkan. */
  averagePerMonth?: number;
  /** @deprecated Ringkasan kini dihitung dari rentang yang sedang ditampilkan. */
  monthDiff?: {
    diff: number;
    percent: number | null;
    isDown: boolean;
    formattedLabel?: string;
  } | null;
}

interface ChartPoint {
  key: string;
  label: string;
  tooltip: string;
  count: number;
}

const nf = (value: number, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits }).format(
    Number.isFinite(value) ? value : 0,
  );

const safeCount = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

/** Skala sumbu Y dengan angka bulat (maks. ±5 interval). */
function getNiceScale(maxValue: number): { top: number; ticks: number[] } {
  const rawStep = Math.max(1, maxValue) / 5;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const stepBase = [1, 2, 5, 10].find((s) => s >= normalized) ?? 10;
  const step = stepBase * magnitude;
  const top = Math.ceil(maxValue / step) * step;

  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) ticks.push(value);
  return { top, ticks };
}

export function BkViolationTrendChart({
  monthlyData,
  dailyData,
  defaultRange = "6_BULAN",
  onRangeChange,
  isLoading = false,
  error = null,
  onRetry,
  periodLabel,
}: BkViolationTrendChartProps) {
  const [range, setRange] = useState<TrendRange>(defaultRange);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const isDaily = range === "BULAN_INI";
  const requestedMonths = range === "SETAHUN" ? 12 : 6;
  const dailyEnabled = dailyData !== undefined || Boolean(onRangeChange);
  const dailyUnavailable = isDaily && dailyData === undefined;

  const handleSelect = (next: TrendRange) => {
    setRange(next);
    setHoveredIndex(null);
    onRangeChange?.(next);
  };

  // Titik yang ditampilkan sesuai rentang terpilih
  const points: ChartPoint[] = useMemo(() => {
    if (isDaily) {
      return (dailyData ?? []).map((d) => ({
        key: d.dayKey,
        label: d.dayLabel,
        tooltip: `Tanggal ${d.dayLabel}`,
        count: safeCount(d.count),
      }));
    }
    return monthlyData.slice(-requestedMonths).map((d) => ({
      key: d.monthKey,
      label: d.monthLabel,
      tooltip: d.monthLabel,
      count: safeCount(d.count),
    }));
  }, [isDaily, dailyData, monthlyData, requestedMonths]);

  // Statistik dihitung dari data yang sedang tampil
  const total = points.reduce((sum, p) => sum + p.count, 0);
  const average = points.length > 0 ? total / points.length : 0;

  let currentCount: number | null = null;
  let previousCount: number | null = null;
  if (isDaily) {
    currentCount = points.length > 0 ? total : null;
    previousCount =
      monthlyData.length >= 2
        ? safeCount(monthlyData[monthlyData.length - 2].count)
        : null;
  } else if (points.length >= 2) {
    currentCount = points[points.length - 1].count;
    previousCount = points[points.length - 2].count;
  }

  const diff =
    currentCount !== null && previousCount !== null
      ? currentCount - previousCount
      : null;
  const percent =
    diff !== null && previousCount ? Math.round((diff / previousCount) * 100) : null;

  const diffIsDown = diff !== null && diff < 0;
  const diffIsUp = diff !== null && diff > 0;
  const diffLabel =
    diff === null
      ? "—"
      : diff === 0
        ? "Stabil (0 kasus)"
        : `${diff > 0 ? "+" : "−"}${nf(Math.abs(diff))} kasus${
            percent !== null ? ` (${diff > 0 ? "+" : "−"}${Math.abs(percent)}%)` : ""
          }`;
  const diffColor = diffIsDown
    ? "text-[#107a55] dark:text-[#34d399]"
    : diffIsUp
      ? "text-[#b85b08] dark:text-amber-400"
      : "text-[#5b6b85] dark:text-[#829dbf]";

  const rangeLabel = isDaily
    ? "bulan berjalan"
    : points.length > 0
      ? `${points[0].label} – ${points[points.length - 1].label}`
      : (periodLabel ?? "-");

  const missingMonths = !isDaily && points.length > 0 && points.length < requestedMonths;

  // Geometri grafik (rasio dipertahankan, tidak ada distorsi)
  const chartWidth = 500;
  const chartHeight = 190;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 32;
  const padBottom = 30;
  const plotWidth = chartWidth - padLeft - padRight;
  const plotHeight = chartHeight - padTop - padBottom;
  const baselineY = chartHeight - padBottom;

  const peakCount = Math.max(0, ...points.map((p) => p.count));
  const { top: yTop, ticks } = getNiceScale(Math.max(5, peakCount));
  const peakIndex = peakCount > 0 ? points.findIndex((p) => p.count === peakCount) : -1;

  const coords = points.map((p, index) => ({
    x:
      points.length === 1
        ? padLeft + plotWidth / 2
        : padLeft + (index / (points.length - 1)) * plotWidth,
    y: baselineY - (p.count / yTop) * plotHeight,
    point: p,
  }));

  const linePath = coords.reduce((acc, c, index) => {
    if (index === 0) return `M ${c.x},${c.y}`;
    const prev = coords[index - 1];
    const midX = prev.x + (c.x - prev.x) / 2;
    return `${acc} C ${midX},${prev.y} ${midX},${c.y} ${c.x},${c.y}`;
  }, "");

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x},${baselineY} L ${coords[0].x},${baselineY} Z`
      : "";

  // Label sumbu X dijarangkan jika titik banyak (tampilan harian)
  const labelStep = points.length > 16 ? 5 : points.length > 10 ? 2 : 1;
  const dotRadius = points.length > 16 ? 2.8 : 3.5;

  const showPlaceholder = isLoading || Boolean(error) || dailyUnavailable;

  return (
    <section
      aria-labelledby="violation-trend-heading"
      className="flex h-full flex-col justify-between rounded-[20px] border border-[#e6ebf3] bg-white p-4 shadow-sm transition-colors duration-200 dark:border-[#173456] dark:bg-[#0d2138] sm:p-5 lg:p-6"
    >
      <div>
        {/* HEADER PANEL & FILTER RENTANG WAKTU */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#b85b08] dark:bg-amber-950/70 dark:text-amber-400"
              aria-hidden="true"
            >
              <TrendingUp size={18} />
            </div>
            <div>
              <h3
                id="violation-trend-heading"
                className="text-[15px] font-bold text-[#071a3a] dark:text-white sm:text-[16px]"
              >
                Tren Pelanggaran Siswa
              </h3>
              <p className="text-[11px] text-[#5b6b85] dark:text-[#829dbf] sm:text-[12px]">
                Jumlah kasus pelanggaran per {isDaily ? "hari" : "bulan"}, {rangeLabel}
              </p>
            </div>
          </div>

          <div
            role="group"
            aria-label="Pilihan rentang waktu"
            className="grid w-full grid-cols-3 gap-1 rounded-xl border border-[#e6ebf3] bg-[#f5f8fc] p-1 text-[12px] font-semibold dark:border-[#173456] dark:bg-[#071526] sm:w-auto sm:min-w-[250px]"
          >
            {TREND_RANGES.map((option) => {
              const isActive = range === option.value;
              const isDisabled = option.value === "BULAN_INI" && !dailyEnabled;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  disabled={isDisabled}
                  title={isDisabled ? "Data harian belum tersedia" : undefined}
                  onClick={() => handleSelect(option.value)}
                  className={`min-h-8 rounded-lg px-2.5 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-45 ${
                    isActive
                      ? "bg-[#f4c542] text-[#071a3a] shadow-sm"
                      : "text-[#5b6b85] hover:bg-white hover:text-[#071a3a] disabled:hover:bg-transparent dark:text-[#829dbf] dark:hover:bg-[#10243d] dark:hover:text-white dark:disabled:hover:bg-transparent"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {missingMonths && !showPlaceholder && (
          <p
            className="mt-3 text-[11px] text-[#5b6b85] dark:text-[#829dbf]"
            role="status"
          >
            Baru tersedia {points.length} dari {requestedMonths} bulan data.
          </p>
        )}

        {/* GRAFIK, LOADING, ERROR, ATAU EMPTY STATE */}
        <div className="relative mt-4">
          {isLoading ? (
            <div
              className="flex h-[200px] w-full items-center justify-center rounded-xl bg-[#f5f8fc] dark:bg-[#071526]/50"
              role="status"
              aria-busy="true"
              aria-label="Memuat grafik pelanggaran"
            >
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : error ? (
            <div
              className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-4 text-center dark:border-red-900/40 dark:bg-red-950/30"
              role="alert"
            >
              <AlertCircle size={22} className="text-red-500" aria-hidden="true" />
              <p className="mt-2 text-[12.5px] font-bold text-red-800 dark:text-red-300">
                Gagal Memuat Tren Pelanggaran
              </p>
              <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-[11.5px] font-bold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <RefreshCw size={12} aria-hidden="true" />
                  <span>Coba Lagi</span>
                </button>
              )}
            </div>
          ) : dailyUnavailable ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e6ebf3] p-4 text-center dark:border-[#173456]">
              <p className="text-[13px] font-bold text-[#071a3a] dark:text-white">
                Data harian belum tersedia
              </p>
              <p className="mt-0.5 max-w-sm text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
                Pilih rentang 6 Bulan atau Setahun untuk melihat tren bulanan.
              </p>
            </div>
          ) : total === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#e6ebf3] p-4 text-center dark:border-[#173456]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck size={22} aria-hidden="true" />
              </div>
              <p className="mt-2 text-[13px] font-bold text-[#071a3a] dark:text-white">
                Belum Ada Pelanggaran Tercatat
              </p>
              <p className="mt-0.5 max-w-sm text-[11.5px] text-[#5b6b85] dark:text-[#829dbf]">
                Tidak ada catatan pelanggaran siswa pada rentang {rangeLabel}.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="block h-auto max-h-[260px] w-full overflow-visible"
                role="img"
                aria-label={`Grafik garis tren pelanggaran ${rangeLabel}. Total ${nf(total)} kasus.`}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient
                    id={`trend-gradient-${gradientId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f4c542" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#f4c542" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#f4c542" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Garis bantu & label sumbu Y */}
                {ticks.map((value) => {
                  const y = baselineY - (value / yTop) * plotHeight;
                  return (
                    <g key={value}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray={value === 0 ? undefined : "3 3"}
                        className={
                          value === 0
                            ? "text-[#cbd5e1] dark:text-[#1b3d63]"
                            : "text-[#e6ebf3] dark:text-[#173456]"
                        }
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-[#5b6b85] text-[10px] dark:fill-[#829dbf]"
                      >
                        {nf(value)}
                      </text>
                    </g>
                  );
                })}

                {areaPath && (
                  <path d={areaPath} fill={`url(#trend-gradient-${gradientId})`} />
                )}

                <path
                  d={linePath}
                  fill="none"
                  stroke="#f4c542"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Titik data, badge nilai, dan label sumbu X */}
                {coords.map((c, i) => {
                  const isHovered = hoveredIndex === i;
                  const isLast = i === coords.length - 1;
                  const showBadge = isHovered || isLast || i === peakIndex;
                  const badgeText = isHovered
                    ? `${c.point.label}: ${nf(c.point.count)}`
                    : nf(c.point.count);
                  const badgeWidth = Math.max(32, badgeText.length * 6.4 + 14);
                  const badgeX = Math.min(
                    Math.max(c.x - badgeWidth / 2, 0),
                    chartWidth - badgeWidth,
                  );
                  const showLabel = i % labelStep === 0 || isLast;

                  return (
                    <g
                      key={c.point.key}
                      tabIndex={0}
                      role="img"
                      aria-label={`${c.point.tooltip}: ${nf(c.point.count)} kasus`}
                      className="cursor-pointer outline-none"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onFocus={() => setHoveredIndex(i)}
                      onBlur={() => setHoveredIndex(null)}
                      onClick={() => setHoveredIndex(i)}
                    >
                      <title>
                        {c.point.tooltip}: {nf(c.point.count)} kasus
                      </title>

                      {/* Area sentuh yang lebih besar dari titiknya */}
                      <circle cx={c.x} cy={c.y} r="10" fill="transparent" />

                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isHovered ? dotRadius + 2 : dotRadius}
                        className="fill-[#f4c542] stroke-white dark:stroke-[#071526]"
                        strokeWidth="2"
                      />

                      {showBadge && (
                        <g className="pointer-events-none">
                          <rect
                            x={badgeX}
                            y={c.y - 27}
                            width={badgeWidth}
                            height="18"
                            rx="4"
                            className="fill-[#071a3a] dark:fill-[#10243d]"
                          />
                          <text
                            x={badgeX + badgeWidth / 2}
                            y={c.y - 14.5}
                            textAnchor="middle"
                            className="fill-white text-[10px] font-extrabold"
                          >
                            {badgeText}
                          </text>
                        </g>
                      )}

                      {showLabel && (
                        <text
                          x={c.x}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className={`text-[11px] ${
                            isLast
                              ? "fill-[#b85b08] font-bold dark:fill-[#f4c542]"
                              : "fill-[#5b6b85] font-semibold dark:fill-[#829dbf]"
                          }`}
                        >
                          {c.point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Alternatif teks untuk pembaca layar */}
              <table className="sr-only">
                <caption>
                  Jumlah kasus pelanggaran per {isDaily ? "hari" : "bulan"}, {rangeLabel}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{isDaily ? "Tanggal" : "Bulan"}</th>
                    <th scope="col">Jumlah kasus</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.key}>
                      <th scope="row">{p.label}</th>
                      <td>{nf(p.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER 3 STATISTIK RINGKASAN (mengikuti rentang terpilih) */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e6ebf3] border-t border-[#f5f8fc] pt-4 dark:divide-[#173456] dark:border-[#163863]">
        <div className="min-w-0 pr-2 sm:pr-3">
          <p className="truncate text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
            Total {rangeLabel}
          </p>
          <p className="mt-1 text-[17px] font-extrabold tabular-nums text-[#071a3a] dark:text-white sm:text-[19px]">
            {showPlaceholder ? "—" : `${nf(total)} kasus`}
          </p>
        </div>

        <div className="min-w-0 px-2 text-center sm:px-3 sm:text-left">
          <p className="text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
            Rata-rata per {isDaily ? "hari" : "bulan"}
          </p>
          <p className="mt-1 text-[17px] font-extrabold tabular-nums text-[#071a3a] dark:text-white sm:text-[19px]">
            {showPlaceholder ? "—" : nf(average, 1)}
          </p>
        </div>

        <div className="min-w-0 pl-2 text-right sm:pl-3 sm:text-left">
          <p className="text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
            {isDaily ? "Bulan ini vs bulan lalu" : "Bulan ini vs lalu"}
          </p>
          <div
            className={`mt-1 flex items-center justify-end gap-1 sm:justify-start ${
              showPlaceholder ? "text-[#5b6b85] dark:text-[#829dbf]" : diffColor
            }`}
          >
            {!showPlaceholder && diffIsDown ? (
              <ArrowDownRight size={16} aria-hidden="true" />
            ) : !showPlaceholder && diffIsUp ? (
              <ArrowUpRight size={16} aria-hidden="true" />
            ) : (
              <Minus size={15} aria-hidden="true" />
            )}
            <span className="truncate text-[13.5px] font-bold tabular-nums sm:text-[14.5px]">
              {showPlaceholder ? "—" : diffLabel}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}