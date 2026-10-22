"use client";

import React, { useState } from "react";
import { SiswaSidebar } from "@/components/siswa/SiswaSidebar";
import { SiswaSidebarDrawer } from "@/components/siswa/SiswaSidebarDrawer";
import { SiswaTopbar } from "@/components/siswa/SiswaTopbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";

interface SiswaLayoutShellProps {
  children: React.ReactNode;
}

export function SiswaLayoutShell({ children }: SiswaLayoutShellProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { profile, profileLoading } = useStudentDashboardData();

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      // Toggle sidebar di layar desktop
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      // Toggle drawer di layar mobile/tablet
      setIsDrawerOpen((prev) => !prev);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ThemeProvider>
      {/* Root Layout Wrapper tanpa batasan overflow yang memutus sticky navbar */}
      <div className="min-h-dvh w-full bg-[#f4f7fb] text-[#0f2847] dark:bg-[#091728] dark:text-white selection:bg-[#f4c542] selection:text-[#071526] transition-colors duration-200">
        <div className="flex min-h-dvh w-full">
          {/* Desktop Sidebar (Collapsible dengan tombol hamburger) */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col border-r border-slate-200 bg-white dark:border-[#203957] dark:bg-[#071526] transition-all duration-300 ease-in-out lg:flex ${
              isDesktopSidebarOpen
                ? "translate-x-0 opacity-100 shadow-sm"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <SiswaSidebar />
          </aside>

          {/* Mobile / Tablet Sidebar Drawer (Slide-in dari kiri) */}
          <SiswaSidebarDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
          />

          {/* Main Content Area (Beradaptasi otomatis saat sidebar desktop di-toggle) */}
          <div
            className={`flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out ${
              isDesktopSidebarOpen ? "lg:pl-[238px]" : "lg:pl-0"
            }`}
          >
            {/* Navbar Siswa Tunggal & Sticky di Paling Atas Viewport */}
            <SiswaTopbar
              onToggleSidebar={handleToggleSidebar}
              profile={profile}
              profileLoading={profileLoading}
            />

            {/* Area Konten Halaman */}
            <main id="main-content" className="w-full min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default SiswaLayoutShell;