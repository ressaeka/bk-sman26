"use client";

import React from "react";
import { useStudentDashboardData } from "@/hooks/useStudentDashboardData";
import { WelcomeCard } from "./WelcomeCard";
import { AssessmentSchedule } from "./AssessmentSchedule";
import { RecentActivityCard } from "./RecentActivityCard";
import { CounselingCard } from "./CounselingCard";
import { ViolationPointsCard } from "./ViolationPointsCard";

export function StudentDashboardView() {
  const {
    profile,
    profileLoading,
    counseling,
    counselingLoading,
  } = useStudentDashboardData();

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
      {/* Welcome */}
      <section className="mb-6 sm:mb-8">
        <WelcomeCard
          profile={profile}
          profileLoading={profileLoading}
        />
      </section>

      {/* Konten Dashboard */}
      <div className="grid grid-cols-1 items-start gap-7 sm:gap-8 lg:grid-cols-12 lg:gap-6 xl:gap-8">
        {/* Kolom Utama */}
        <div className="min-w-0 space-y-7 sm:space-y-8 lg:col-span-7 lg:space-y-6 xl:col-span-7">
          <section>
            <AssessmentSchedule />
          </section>

          <section>
            <RecentActivityCard />
          </section>
        </div>

        {/* Kolom Informasi Tambahan */}
        <aside className="min-w-0 space-y-7 sm:space-y-8 lg:col-span-5 lg:space-y-6 xl:col-span-5">
          <section>
            <ViolationPointsCard
              profile={profile}
              profileLoading={profileLoading}
            />
          </section>

          <section>
            <CounselingCard
              counseling={counseling}
              counselingLoading={counselingLoading}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}