"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  FileText,
  Calendar,
  MessageSquare,
  Compass,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";
import { StudentActivityItem } from "@/services/activity.service";

function formatActivityTime(timestampStr: string): string {
  try {
    const date = new Date(timestampStr);
    if (isNaN(date.getTime())) return timestampStr;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const jam = String(date.getHours()).padStart(2, "0");
    const menit = String(date.getMinutes()).padStart(2, "0");
    const timeFormatted = `${jam}.${menit} WIB`;

    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return `Hari ini, ${timeFormatted}`;
    }
    if (diffDays === 1) {
      return `Kemarin, ${timeFormatted}`;
    }

    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date);

    return `${dateFormatted} · ${timeFormatted}`;
  } catch {
    return timestampStr;
  }
}

export function RecentActivityCard() {
  const { get } = useApiClient();
  const [activities, setActivities] = useState<StudentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchActivities() {
      try {
        const response = await get<StudentActivityItem[]>("/api/siswa/activity?limit=5");

        if (!isMounted) return;

        if (!response.success || !response.data) {
          throw new Error(response.message || "Gagal memuat aktivitas terbaru.");
        }

        setActivities(response.data);
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

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [get, reloadKey]);

  const renderIcon = (iconName: StudentActivityItem["iconName"]) => {
    switch (iconName) {
      case "FileText":
        return <FileText size={16} className="text-amber-600 dark:text-amber-400" />;
      case "Calendar":
        return <Calendar size={16} className="text-blue-600 dark:text-blue-400" />;
      case "MessageSquare":
        return <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-400" />;
      case "Compass":
        return <Compass size={16} className="text-purple-600 dark:text-purple-400" />;
      case "Sparkles":
        return <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Clock size={16} className="text-slate-600 dark:text-slate-400" />;
    }
  };

  const getBadgeStyle = (variant?: StudentActivityItem["badgeVariant"]) => {
    switch (variant) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60";
      case "danger":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="w-full rounded-2xl sm:rounded-[20px] bg-white dark:bg-[#0d2138] border border-slate-200/90 dark:border-[#173456] p-3.5 sm:p-5 shadow-sm transition-colors duration-200 flex flex-col justify-between">
      {/* Header Kartu */}
      <div>
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-[#163863]">
          <div className="flex items-center gap-2">
            <Clock size={17} className="text-slate-700 dark:text-slate-300 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Aktivitas terbaru
            </h3>
          </div>
          <Link
            href="/siswa/konseling"
            className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#20497e] bg-slate-50 dark:bg-[#163863] text-slate-600 dark:text-[#8ea7c5] hover:text-slate-900 dark:hover:text-white text-[10px] sm:text-[11px] font-medium transition-colors"
          >
            Riwayat
          </Link>
        </div>

        {/* Konten Aktivitas */}
        <div className="pt-2">
          {isLoading ? (
            /* Loading Skeleton */
            <div className="space-y-3 py-2 animate-pulse" aria-label="Memuat aktivitas terbaru">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-3 p-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-2.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div
              role="alert"
              className="py-4 px-3 text-center flex flex-col items-center justify-center rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
            >
              <AlertCircle size={20} className="text-red-500 mb-1.5" />
              <p className="text-xs font-semibold text-red-800 dark:text-red-300 max-w-xs">
                {error}
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={12} />
                <span>Coba lagi</span>
              </button>
            </div>
          ) : activities.length === 0 ? (
            /* Empty State */
            <div className="py-4 sm:py-6 px-2 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-100 dark:bg-[#153457] text-slate-500 dark:text-slate-400 flex items-center justify-center mb-2 shadow-sm">
                <FileText size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Aktivitas terbaru akan muncul di sini.
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8fa6c1] leading-relaxed max-w-sm mt-0.5">
                Lakukan pengisian angket atau pengajuan konseling untuk melihat riwayat aktivitasmu.
              </p>
            </div>
          ) : (
            /* Daftar Aktivitas Riil */
            <div className="divide-y divide-slate-100 dark:divide-[#163863]/60 -mx-1">
              {activities.map((item) => {
                const ItemContent = (
                  <div className="flex items-start gap-3 p-2.5 rounded-xl transition hover:bg-slate-50 dark:hover:bg-[#112946]/50">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#153457] flex items-center justify-center shrink-0 mt-0.5">
                      {renderIcon(item.iconName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {item.title}
                        </h4>
                        {item.status && (
                          <span
                            className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold leading-none ${getBadgeStyle(
                              item.badgeVariant
                            )}`}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#8fa6c1] mt-0.5 line-clamp-1 leading-snug">
                        {item.description}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-[#6e85a1] mt-1 block">
                        {formatActivityTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );

                if (item.linkHref) {
                  return (
                    <Link key={item.id} href={item.linkHref} className="block">
                      {ItemContent}
                    </Link>
                  );
                }

                return <div key={item.id}>{ItemContent}</div>;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
