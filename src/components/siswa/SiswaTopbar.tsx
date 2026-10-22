
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useApiClient } from "@/hooks/useApiClient";
import { StudentProfile } from "@/hooks/useStudentDashboardData";

interface SiswaTopbarProps {
  onToggleSidebar: () => void;
  profile: StudentProfile | null;
  profileLoading?: boolean;
}

export function SiswaTopbar({
  onToggleSidebar,
  profile,
  profileLoading = false,
}: SiswaTopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const api = useApiClient();

  const displayName =
    profile?.nama || (profileLoading ? "Memuat..." : "Siswa SMAN 26");

  const displayClass =
    profile?.rombel ||
    (profileLoading ? "Memuat kelas..." : "Kelas Belum Terdata");

  const getInitials = (name: string) => {
    const clean = name.trim();

    if (!clean || clean === "Memuat...") return "S";

    const parts = clean.split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return clean.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setIsProfileOpen(false);

    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout request gagal:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 bg-white/95 text-slate-800 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-[#1a385c] dark:bg-[#091728]/95 dark:text-white">
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-3 px-3.5 py-2.5 sm:min-h-[72px] sm:px-6 sm:py-3.5 lg:px-8">
        {/* KIRI: HAMBURGER DAN JUDUL */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Buka menu navigasi"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 dark:border-[#1a385c] dark:bg-[#0e2137] dark:text-white dark:hover:bg-[#143152] sm:h-11 sm:w-11"
          >
            <Menu
              size={20}
              className="sm:h-[22px] sm:w-[22px]"
              strokeWidth={2.2}
            />
          </button>

          {/* JUDUL HALAMAN */}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Dashboard
            </h1>

            <p className="mt-0.5 hidden truncate text-xs text-slate-500 dark:text-[#829dbf] sm:block sm:text-sm">
              Ringkasan tes, jadwal, dan konselingmu
            </p>
          </div>
        </div>

        {/* KANAN: TEMA DAN PROFIL */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* TOGGLE DARK / LIGHT MODE */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Beralih ke mode terang"
                : "Beralih ke mode gelap"
            }
            title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 dark:border-[#1a385c] dark:bg-[#0e2137] dark:text-white dark:hover:bg-[#143152] sm:h-11 sm:w-11"
          >
            {theme === "dark" ? (
              <Sun size={19} className="text-[#f4c542]" />
            ) : (
              <Moon size={19} className="text-slate-700" />
            )}
          </button>

          {/* PROFIL SISWA */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((open) => !open)}
              aria-label="Menu profil siswa"
              aria-expanded={isProfileOpen}
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 transition-colors hover:bg-slate-200 active:scale-95 dark:border-[#1a385c] dark:bg-[#0e2137] dark:hover:bg-[#143152] sm:h-11 sm:px-3 sm:py-1.5"
            >
              {/* AVATAR */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4c542] text-xs font-black text-[#071526] shadow-sm">
                {getInitials(displayName)}
              </div>

              {/* NAMA DAN KELAS: TABLET / DESKTOP */}
              <div className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[130px] truncate text-xs font-bold leading-tight text-slate-800 dark:text-white sm:text-sm">
                  {displayName}
                </span>

                <span className="block max-w-[130px] truncate text-[11px] leading-tight text-slate-500 dark:text-[#829dbf]">
                  {displayClass}
                </span>
              </div>

              <ChevronDown
                size={15}
                aria-hidden="true"
                className={`hidden shrink-0 text-slate-400 transition-transform duration-200 dark:text-[#829dbf] sm:block ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* DROPDOWN PROFIL */}
            {isProfileOpen && (
              <>
                {/* Backdrop untuk menutup dropdown saat klik di luar */}
                <button
                  type="button"
                  aria-label="Tutup menu profil"
                  onClick={() => setIsProfileOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-[min(280px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 dark:border-[#1a385c] dark:bg-[#0e2137]">
                  {/* INFORMASI SISWA */}
                  <div className="border-b border-slate-100 px-4 py-3 dark:border-[#1a385c]">
                    <p className="break-words text-sm font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </p>

                    <p className="mt-0.5 break-words text-xs text-slate-500 dark:text-[#829dbf]">
                      {displayClass}
                    </p>
                  </div>

                  {/* DATA PRIBADI */}
                  <Link
                    href="/siswa/profil"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex min-h-[44px] items-center gap-2.5 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-[#b2c5dc] dark:hover:bg-[#143152] dark:hover:text-white"
                  >
                    <User size={16} className="shrink-0" />
                    <span>Data Pribadi</span>
                  </Link>

                  {/* PEMBATAS */}
                  <div className="my-1 border-t border-slate-100 dark:border-[#1a385c]" />

                  {/* LOGOUT */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex min-h-[44px] w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    {isLoggingOut ? (
                      <LoaderCircle
                        size={16}
                        className="shrink-0 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <LogOut
                        size={16}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                    )}

                    <span>
                      {isLoggingOut ? "Sedang keluar..." : "Logout"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
