"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  ChevronDown,
  LogOut,
  User,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { CounselorProfile } from "@/hooks/useBkDashboardData";
import { useApiClient } from "@/hooks/useApiClient";
import { useTheme } from "@/components/theme/ThemeProvider";

interface BkTopbarProps {
  onToggleSidebar: () => void;
  profile: CounselorProfile | null;
  profileLoading?: boolean;
}

export function BkTopbar({
  onToggleSidebar,
  profile,
  profileLoading = false,
}: BkTopbarProps) {
  const router = useRouter();
  const { post } = useApiClient();
  const { theme, toggleTheme } = useTheme();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown ketika pengguna klik di luar menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout akun Guru BK
  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await post("/api/auth/logout");
    } catch {
      // Tetap arahkan ke login jika ada kegagalan jaringan
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const displayName = profile?.nama || "Guru BK";

  const initial =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GB";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 shadow-sm backdrop-blur-md transition-colors duration-200 dark:border-[#1a385c] dark:bg-[#091728]/95 dark:text-white sm:px-6 lg:px-8">
      {/* BAGIAN KIRI: TOGGLE SIDEBAR DAN JUDUL */}
      <div className="flex min-w-0 items-center gap-3.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar navigasi"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:border-[#1a385c] dark:bg-[#0e2137] dark:text-white dark:hover:bg-[#143152] sm:h-11 sm:w-11"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight tracking-tight text-slate-900 transition-colors dark:text-white sm:text-xl">
            Dashboard
          </h1>

          <p className="hidden truncate text-xs font-medium text-slate-500 transition-colors dark:text-[#829dbf] sm:block">
            Ringkasan aktivitas bimbingan dan konseling
          </p>
        </div>
      </div>

      {/* BAGIAN KANAN: THEME TOGGLE, NOTIFIKASI, DAN PROFIL */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Tombol Light / Dark Mode Toggle (Satu Sistem dengan Siswa) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Beralih ke mode terang"
              : "Beralih ke mode gelap"
          }
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:border-[#1a385c] dark:bg-[#0e2137] dark:text-white dark:hover:bg-[#143152] sm:h-11 sm:w-11"
        >
          {theme === "dark" ? (
            <Sun size={19} className="text-[#f4c542]" />
          ) : (
            <Moon size={19} className="text-slate-700" />
          )}
        </button>

        {/* PROFIL GURU BK */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
            aria-label="Menu akun Guru BK"
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1 transition-colors hover:bg-slate-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:border-[#1a385c] dark:bg-[#0e2137] dark:hover:bg-[#143152] sm:h-11 sm:px-3 sm:py-1.5"
          >
            {/* Avatar */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f4c542] text-xs font-black text-[#071526] shadow-sm">
              {profileLoading ? (
                <Loader2 size={14} className="animate-spin text-[#071a3a]" />
              ) : (
                initial
              )}
            </div>

            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[130px] truncate text-[12.5px] font-bold leading-tight text-slate-900 dark:text-white">
                {displayName}
              </p>

              <p className="text-[10.5px] font-medium text-slate-500 dark:text-[#829dbf]">
                {profile?.nip ? `NIP. ${profile.nip}` : "Akun Guru BK"}
              </p>
            </div>

            <ChevronDown
              size={15}
              className={`text-slate-500 transition-transform duration-200 dark:text-[#829dbf] ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* DROPDOWN PROFIL */}
          {isDropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition-colors dark:border-[#1a385c] dark:bg-[#0d2138]"
            >
              <div className="border-b border-slate-100 px-3 py-2 sm:hidden dark:border-[#163863]">
                <p className="truncate text-[12.5px] font-bold text-slate-900 dark:text-white">
                  {displayName}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-[#829dbf]">
                  {profile?.nip ? `NIP. ${profile.nip}` : "Akun Guru BK"}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push("/bk/pengaturan");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] dark:text-slate-200 dark:hover:bg-[#143152]"
              >
                <User size={16} className="text-slate-400 dark:text-[#829dbf]" />
                <span>Pengaturan Profil</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {isLoggingOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}

                <span>{isLoggingOut ? "Memproses..." : "Keluar Akun"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}