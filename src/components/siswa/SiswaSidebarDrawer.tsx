"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { SiswaSidebar } from "./SiswaSidebar";

interface SiswaSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiswaSidebarDrawer({ isOpen, onClose }: SiswaSidebarDrawerProps) {
  // Cegah scroll pada body ketika drawer terbuka di perangkat mobile
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
    <div className="fixed inset-0 z-50 lg:hidden" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 w-[270px] max-w-[85vw] bg-white dark:bg-[#0b1c30] shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-250 transition-colors">
        {/* Tombol Tutup */}
        <div className="absolute top-4 right-3 z-50">
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-[#9bb2cd] dark:hover:text-white dark:hover:bg-[#152e4d] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigasi */}
        <div className="h-full w-full overflow-y-auto">
          <SiswaSidebar onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}
