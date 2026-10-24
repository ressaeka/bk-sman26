"use client";

import React, { useEffect } from "react";
import { BkSidebar } from "./BkSidebar";

interface BkSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCounselingCount?: number;
}

export function BkSidebarDrawer({
  isOpen,
  onClose,
  pendingCounselingCount = 4,
}: BkSidebarDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      aria-modal="true"
      role="dialog"
      aria-label="Menu navigasi mobile Guru BK"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-[275px] max-w-[85vw] flex-col bg-white dark:bg-[#071526] shadow-2xl duration-200 animate-in slide-in-from-left">
        <BkSidebar
          onNavigate={onClose}
          pendingCounselingCount={pendingCounselingCount}
          isMobileDrawer={true}
        />
      </div>
    </div>
  );
}
