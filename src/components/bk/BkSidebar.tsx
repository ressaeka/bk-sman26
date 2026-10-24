"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  MessageSquare,
  AlertTriangle,
  FileText,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

interface BkSidebarProps {
  onNavigate?: () => void;
  pendingCounselingCount?: number;
  isMobileDrawer?: boolean;
}

export function BkSidebar({
  onNavigate,
  pendingCounselingCount = 4,
  isMobileDrawer = false,
}: BkSidebarProps) {
  const pathname = usePathname();
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === "/bk") {
      return pathname === "/bk";
    }
    return pathname.startsWith(href);
  };

  const isAssessmentRoute =
    pathname.startsWith("/bk/asesmen") ||
    pathname.startsWith("/bk/assessment");

  const navItemClass = (active: boolean) =>
    [
      "relative flex min-h-[44px] w-full items-center gap-3",
      "rounded-xl px-3.5 py-2.5",
      "text-[13.5px] font-semibold leading-5",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542] focus-visible:ring-offset-2",
      active
        ? "bg-[#f4c542] text-[#071a3a] shadow-sm font-bold"
        : [
            "text-[#5b6b85] hover:bg-[#f5f8fc] hover:text-[#071a3a]",
            "dark:text-[#a3b7cf] dark:hover:bg-[#10243d] dark:hover:text-white",
          ].join(" "),
    ].join(" ");

  const subItemClass = (active: boolean) =>
    [
      "flex min-h-[38px] w-full items-center gap-2.5",
      "rounded-lg px-3 py-2",
      "text-[12.5px] font-medium leading-5",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542]",
      active
        ? [
            "bg-[#fef6da] text-[#0b2552] font-semibold",
            "dark:bg-[#172d42] dark:text-[#f4c542]",
          ].join(" ")
        : [
            "text-[#5b6b85] hover:bg-[#f5f8fc] hover:text-[#071a3a]",
            "dark:text-[#91a9c5] dark:hover:bg-[#10243d] dark:hover:text-white",
          ].join(" "),
    ].join(" ");

  return (
    <aside
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-[#e6ebf3] bg-white text-[#071a3a] transition-colors duration-200 dark:border-[#132c4a]/70 dark:bg-[#071526] dark:text-white"
      aria-label="Sidebar Guru BK"
    >
      {/* BRAND & LOGO SEKOLAH */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#e6ebf3] px-5 py-4 dark:border-[#132c4a]/70">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/images/logo-sman26.png"
              alt="Logo SMAN 26 Kabupaten Tangerang"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[13.5px] font-bold leading-tight text-[#071a3a] dark:text-white">
              Sistem Informasi BK
            </h1>
            <p className="mt-0.5 truncate text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf]">
              SMAN 26 Kab. Tangerang
            </p>
          </div>
        </div>

        {/* Tombol Tutup Khusus Mobile Drawer */}
        {isMobileDrawer && onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Tutup sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#5b6b85] hover:bg-[#f5f8fc] hover:text-[#071a3a] dark:text-[#9bb2cd] dark:hover:bg-[#152e4d] dark:hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* DAFTAR MENU NAVIGASI */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1" aria-label="Navigasi Menu Guru BK">
          {/* 1. Dashboard */}
          <Link
            href="/bk"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk"))}
            aria-current={isActive("/bk") ? "page" : undefined}
          >
            <LayoutGrid size={19} className="shrink-0" />
            <span className="flex-1 truncate">Dashboard</span>
          </Link>

          {/* 2. Data Siswa */}
          <Link
            href="/bk/siswa"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/siswa"))}
            title="Data Siswa (Dalam Pengembangan)"
          >
            <Users size={19} className="shrink-0" />
            <span className="flex-1 truncate">Data Siswa</span>
          </Link>

          {/* 3. Konseling (dengan badge jumlah menunggu) */}
          <Link
            href="/bk/konseling"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/konseling"))}
          >
            <MessageSquare size={19} className="shrink-0" />
            <span className="flex-1 truncate">Konseling</span>
            {pendingCounselingCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#071a3a] px-1.5 text-[11px] font-bold text-white dark:bg-[#143356]">
                {pendingCounselingCount}
              </span>
            )}
          </Link>

          {/* 4. Pelanggaran & Poin */}
          <Link
            href="/bk/pelanggaran"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/pelanggaran"))}
          >
            <AlertTriangle size={19} className="shrink-0" />
            <span className="flex-1 truncate">Pelanggaran & Poin</span>
          </Link>

          {/* 5. Asesmen Siswa (Accordion) */}
          <div>
            <button
              type="button"
              onClick={() => setIsAssessmentOpen((prev) => !prev)}
              aria-expanded={isAssessmentOpen}
              className={[
                "flex min-h-[44px] w-full items-center justify-between gap-3",
                "rounded-xl px-3.5 py-2.5",
                "text-[13.5px] font-semibold leading-5 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4c542]",
                isAssessmentRoute
                  ? "text-[#071a3a] dark:text-white"
                  : [
                      "text-[#5b6b85] hover:bg-[#f5f8fc] hover:text-[#071a3a]",
                      "dark:text-[#a3b7cf] dark:hover:bg-[#10243d] dark:hover:text-white",
                    ].join(" "),
              ].join(" ")}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <FileText size={19} className="shrink-0" />
                <span className="truncate">Asesmen Siswa</span>
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform duration-200 text-[#5b6b85] dark:text-[#829dbf] ${
                  isAssessmentOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAssessmentOpen && (
              <div className="ml-5 mt-1 space-y-1 border-l-2 border-[#e6ebf3] py-0.5 pl-3 dark:border-[#19375b]">
                <Link
                  href="/bk/asesmen/angket-masalah"
                  onClick={onNavigate}
                  className={subItemClass(isActive("/bk/asesmen/angket-masalah"))}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b6b85] dark:bg-[#829dbf]" />
                  <span className="truncate">Angket Masalah</span>
                </Link>
                <Link
                  href="/bk/asesmen/gaya-belajar"
                  onClick={onNavigate}
                  className={subItemClass(isActive("/bk/asesmen/gaya-belajar"))}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b6b85] dark:bg-[#829dbf]" />
                  <span className="truncate">Gaya Belajar</span>
                </Link>
                <Link
                  href="/bk/asesmen/minat-bakat"
                  onClick={onNavigate}
                  className={subItemClass(isActive("/bk/asesmen/minat-bakat"))}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b6b85] dark:bg-[#829dbf]" />
                  <span className="truncate">Minat & Bakat</span>
                </Link>
              </div>
            )}
          </div>

          {/* 6. Jadwal Asesmen */}
          <Link
            href="/bk/jadwal-asesmen"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/jadwal-asesmen"))}
          >
            <Calendar size={19} className="shrink-0" />
            <span className="flex-1 truncate">Jadwal Asesmen</span>
          </Link>

          {/* 7. Rekap & DSS */}
          <Link
            href="/bk/rekap"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/rekap"))}
          >
            <BarChart3 size={19} className="shrink-0" />
            <span className="flex-1 truncate">Rekap & DSS</span>
          </Link>

          {/* 8. Notifikasi */}
          <Link
            href="/bk/notifikasi"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/notifikasi"))}
          >
            <Bell size={19} className="shrink-0" />
            <span className="flex-1 truncate">Notifikasi</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#071a3a] px-1.5 text-[11px] font-bold text-white dark:bg-[#143356]">
              3
            </span>
          </Link>

          {/* 9. Pengaturan Akun */}
          <Link
            href="/bk/pengaturan"
            onClick={onNavigate}
            className={navItemClass(isActive("/bk/pengaturan"))}
          >
            <Settings size={19} className="shrink-0" />
            <span className="flex-1 truncate">Pengaturan Akun</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
}
