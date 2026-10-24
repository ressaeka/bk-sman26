"use client";

import React from "react";

interface BkWelcomeHeroProps {
  attentionCount?: number;
}

export function BkWelcomeHero({
}: BkWelcomeHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[20px] bg-[#071a3a] p-4 text-white shadow-sm transition-colors duration-200 dark:border dark:border-[#173456] sm:rounded-[24px] sm:p-6 lg:rounded-[28px] lg:p-7">
      <div className="relative z-10 flex flex-col gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl lg:text-2xl">
            Halo, Guru BK 👋
          </h2>

          <p className="mt-1.5 text-xs leading-relaxed text-[#e6ebf3] sm:text-sm lg:text-[14px]">
            Pantau aktivitas konseling, perkembangan asesmen, dan kebutuhan
            tindak lanjut siswa dalam satu tempat.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        </div>
      </div>
    </div>
  );
}
