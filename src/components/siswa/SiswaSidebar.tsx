"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  ChevronDown,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Bell,
} from "lucide-react";

interface SiswaSidebarProps {
  onNavigate?: () => void;
}

export function SiswaSidebar({ onNavigate }: SiswaSidebarProps) {
  const pathname = usePathname();
  const isAssessmentRoute = pathname.startsWith("/siswa/asesmen");

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(isAssessmentRoute);

  const isActive = (href: string) => {
    if (href === "/siswa") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItemClass = (active: boolean) =>
    [
      "relative flex min-h-[50px] w-full items-center gap-3.5",
      "rounded-xl px-4 py-3",
      "text-sm font-semibold leading-5",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[#f4c542]",
      active
        ? "bg-[#f4c542] text-[#091728] shadow-sm"
        : [
            "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            "dark:text-[#a3b7cf] dark:hover:bg-[#10243d]",
            "dark:hover:text-white",
          ].join(" "),
    ].join(" ");

  const subItemClass = (active: boolean) =>
    [
      "flex min-h-[43px] w-full items-center gap-2.5",
      "rounded-lg px-3 py-2.5",
      "text-[13px] font-medium leading-5",
      "transition-colors duration-200",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[#f4c542]",
      active
        ? [
            "bg-amber-50 font-semibold text-amber-800",
            "dark:bg-[#172d42] dark:text-[#f4c542]",
          ].join(" ")
        : [
            "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
            "dark:text-[#91a9c5] dark:hover:bg-[#10243d]",
            "dark:hover:text-white",
          ].join(" "),
    ].join(" ");

  const renderNavLink = (
    href: string,
    label: string,
    Icon: typeof LayoutGrid
  ) => {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={navItemClass(active)}
      >
        {active && (
          <span
            className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#091728]"
            aria-hidden="true"
          />
        )}

        <Icon
          size={20}
          strokeWidth={active ? 2.3 : 2}
          className="shrink-0"
          aria-hidden="true"
        />

        <span className="min-w-0 flex-1">{label}</span>
      </Link>
    );
  };

  const renderSubLink = (href: string, label: string) => {
    const active = isActive(href);

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={subItemClass(active)}
      >
        <span
          className={[
            "h-1.5 w-1.5 shrink-0 rounded-full",
            active
              ? "bg-amber-500"
              : "bg-slate-300 dark:bg-slate-600",
          ].join(" ")}
          aria-hidden="true"
        />

        <span className="min-w-0 flex-1">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-800 transition-colors duration-200 dark:border-[#132c4a]/70 dark:bg-[#071526] dark:text-white">
      {/* BRAND DAN LOGO SEKOLAH */}
      <div className="shrink-0 border-b border-slate-100 px-5 py-6 dark:border-[#132c4a]/70">
        <div className="flex items-center gap-3.5">
        {/* LOGO SEKOLAH TANPA BACKGROUND */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
          <Image
            src="/images/logo-sman26.png"
            alt="Logo SMAN 26 Kabupaten Tangerang"
            width={50}
            height={50}
            priority
            className="h-full w-full object-contain"
          />
        </div>

          <div className="min-w-0 flex-1">
            <h1 className="whitespace-nowrap text-[13px] font-extrabold leading-5 tracking-tight text-slate-900 dark:text-white">
              Sistem Informasi BK
            </h1>

            <p className="mt-1 whitespace-nowrap text-[10px] font-medium leading-4 tracking-wide text-slate-500 dark:text-[#829dbf]">
              SMAN 26 Kab. Tangerang
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGASI */}
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-5">
        <nav className="space-y-1.5" aria-label="Navigasi Siswa">
          {renderNavLink("/siswa", "Dashboard", LayoutGrid)}

          {/* MENU ASESMEN */}
          <div>
            <button
              type="button"
              onClick={() => setIsAssessmentOpen((open) => !open)}
              aria-expanded={isAssessmentOpen}
              aria-controls="siswa-assessment-submenu"
              className={[
                "flex min-h-[50px] w-full items-center",
                "justify-between gap-3 rounded-xl px-4 py-3",
                "text-sm font-semibold leading-5",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[#f4c542]",
                isAssessmentRoute
                  ? "text-slate-900 dark:text-white"
                  : [
                      "text-slate-600 hover:bg-slate-100",
                      "hover:text-slate-950 dark:text-[#a3b7cf]",
                      "dark:hover:bg-[#10243d] dark:hover:text-white",
                    ].join(" "),
              ].join(" ")}
            >
              <span className="flex min-w-0 flex-1 items-center gap-3.5">
                <FileText
                  size={20}
                  strokeWidth={2}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span>Asesmen</span>
              </span>

              <ChevronDown
                size={17}
                className={[
                  "shrink-0 text-slate-400",
                  "transition-transform duration-200",
                  "dark:text-[#829dbf]",
                  isAssessmentOpen ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {isAssessmentOpen && (
              <div
                id="siswa-assessment-submenu"
                className="ml-6 mt-2 space-y-1 border-l-2 border-slate-200 py-1 pl-3 dark:border-[#19375b]"
              >
                {renderSubLink(
                  "/siswa/asesmen/angket-masalah",
                  "Angket Masalah"
                )}

                {renderSubLink(
                  "/siswa/asesmen/gaya-belajar",
                  "Gaya Belajar"
                )}

                {renderSubLink(
                  "/siswa/asesmen/minat-bakat",
                  "Minat & Bakat"
                )}
              </div>
            )}
          </div>

          {/* MENU LAINNYA */}
          {renderNavLink("/siswa/notifikasi", "Notifikasi", Bell)}

          {renderNavLink(
            "/siswa/hasil-asesmen",
            "Hasil Asesmen",
            BarChart3
          )}

          {renderNavLink("/siswa/konseling", "Konseling", MessageSquare)}

          {renderNavLink(
            "/siswa/pelanggaran",
            "Pelanggaran & Poin",
            AlertTriangle
          )}
        </nav>
      </div>
    </aside>
  );
}