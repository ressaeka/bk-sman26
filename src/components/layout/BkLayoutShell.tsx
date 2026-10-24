"use client";

import React, { useState } from "react";
import { BkSidebar } from "@/components/bk/BkSidebar";
import { BkSidebarDrawer } from "@/components/bk/BkSidebarDrawer";
import { BkTopbar } from "@/components/bk/BkTopbar";
import { useBkDashboardData } from "@/hooks/useBkDashboardData";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

interface BkLayoutShellProps {
  children: React.ReactNode;
}

export function BkLayoutShell({ children }: BkLayoutShellProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { profile, isLoading, konselingPendingCount } = useBkDashboardData();

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      setIsDrawerOpen((prev) => !prev);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ThemeProvider>
      <div className="min-h-dvh w-full bg-[#f5f8fc] text-[#071a3a] selection:bg-[#f4c542] selection:text-[#071a3a] transition-colors duration-200 dark:bg-[#091728] dark:text-white">
        <div className="flex min-h-dvh w-full">
          {/* Desktop Sidebar (Collapsible) */}
          <aside
            className={`fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-[#e6ebf3] bg-white transition-all duration-200 ease-in-out dark:border-[#132c4a]/70 dark:bg-[#071526] lg:flex ${
              isDesktopSidebarOpen
                ? "translate-x-0 opacity-100 shadow-xs"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <BkSidebar pendingCounselingCount={konselingPendingCount} />
          </aside>

          {/* Mobile / Tablet Sidebar Drawer */}
          <BkSidebarDrawer
            isOpen={isDrawerOpen}
            onClose={handleCloseDrawer}
            pendingCounselingCount={konselingPendingCount}
          />

          {/* Main Content Area */}
          <div
            className={`flex min-h-dvh min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-in-out ${
              isDesktopSidebarOpen ? "lg:pl-[250px]" : "lg:pl-0"
            }`}
          >
            {/* Topbar Header */}
            <BkTopbar
              onToggleSidebar={handleToggleSidebar}
              profile={profile}
              profileLoading={isLoading}
            />

            {/* Halaman Konten */}
            <main id="bk-main-content" className="w-full min-w-0 flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
