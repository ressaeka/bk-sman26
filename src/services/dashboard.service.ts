import { dashboardRepository } from "@/repositories/dashboard.repository";

export interface MonthlyTrendBucket {
  monthKey: string; // "YYYY-MM"
  monthLabel: string; // "Mei"
  fullLabel: string; // "Mei 2026"
  year: number;
  monthIndex: number; // 0-11
  count: number;
  totalPoin: number;
}

export interface DashboardStatsResult {
  overview: {
    totalSiswa: number;
    konselingPending: number;
    activeSchedulesCount: number;
    criticalStudentsCount: number;
    totalViolationRecords: number;
    pendingAngketReviewCount: number;
  };
  counseling: {
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    total: number;
    completionRate: number; // Persentase sesi selesai
  };
  assessments: {
    totalSiswa: number;
    angketMasalahCount: number;
    angketMasalahPercent: number;
    gayaBelajarCount: number;
    gayaBelajarPercent: number;
    minatBakatCount: number;
    minatBakatPercent: number;
  };
  violations: {
    totalRecords: number;
    criticalCount: number;
    completedFollowUp: number;
    followUpBreakdown: {
      belumDitangani: number;
      dalamPembinaan: number;
      selesai: number;
      dibatalkan: number;
    };
    categories: {
      kedisiplinan: number;
      tataTertib: number;
      lainnya: number;
    };
    trend: {
      periodLabel: string;
      startMonthLabel: string;
      endMonthLabel: string;
      months: MonthlyTrendBucket[];
      totalCases: number;
      averagePerMonth: number;
      monthDiff: {
        diff: number;
        percent: number | null; // null jika pembagian dengan 0 tidak terdefinisi
        isDown: boolean;
        formattedLabel: string;
      };
    };
  };
  serverTimestamp: string;
}

export const INDONESIAN_MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const INDONESIAN_MONTH_FULL = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const dashboardService = {
  /**
   * Menghasilkan baseline 6 bulan kalender terakhir dengan penanganan pergantian tahun
   */
  generateSixMonthsBaseline(now: Date = new Date()): MonthlyTrendBucket[] {
    const buckets: MonthlyTrendBucket[] = [];
    for (let i = 5; i >= 0; i--) {
      // Hitung bulan ke-(i) dari sekarang
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIndex = d.getMonth();
      const year = d.getFullYear();
      const monthKey = `${year}-${String(mIndex + 1).padStart(2, "0")}`;

      buckets.push({
        monthKey,
        monthLabel: INDONESIAN_MONTH_SHORT[mIndex],
        fullLabel: `${INDONESIAN_MONTH_FULL[mIndex]} ${year}`,
        year,
        monthIndex: mIndex,
        count: 0,
        totalPoin: 0,
      });
    }
    return buckets;
  },

  /**
   * Format label rentang periode yang benar jika melewati pergantian tahun
   */
  formatPeriodLabel(buckets: MonthlyTrendBucket[]): string {
    if (buckets.length === 0) return "6 Bulan Terakhir";
    const start = buckets[0];
    const end = buckets[buckets.length - 1];

    if (start.year !== end.year) {
      return `${start.monthLabel} ${start.year} - ${end.monthLabel} ${end.year}`;
    }
    return `${start.monthLabel} - ${end.monthLabel} ${end.year}`;
  },

  /**
   * Menghitung selisih dan persentase perubahan bulan berjalan vs bulan sebelumnya
   */
  calculateMonthDiff(
    currentCount: number,
    prevCount: number
  ): {
    diff: number;
    percent: number | null;
    isDown: boolean;
    formattedLabel: string;
  } {
    const diff = currentCount - prevCount;
    const isDown = diff < 0;

    // Kasus 1: Kedua bulan sama-sama 0 kasus
    if (currentCount === 0 && prevCount === 0) {
      return {
        diff: 0,
        percent: 0,
        isDown: false,
        formattedLabel: "Stabil (0 kasus)",
      };
    }

    // Kasus 2: Bulan sebelumnya 0 kasus, bulan ini memiliki kasus (pembagian /0 tak terdefinisi)
    if (prevCount === 0 && currentCount > 0) {
      return {
        diff,
        percent: null,
        isDown: false,
        formattedLabel: `+${currentCount} kasus (Baru)`,
      };
    }

    // Kasus 3: Bulan sebelumnya memiliki kasus, bulan ini 0 kasus (penurunan 100%)
    if (prevCount > 0 && currentCount === 0) {
      return {
        diff,
        percent: 100,
        isDown: true,
        formattedLabel: `-100% (Turun ${prevCount} kasus)`,
      };
    }

    // Kasus 4: Kedua bulan memiliki kasus > 0
    const percent = Math.round((Math.abs(diff) / prevCount) * 100);
    const directionText = isDown ? "Turun" : "Naik";
    const sign = isDown ? "-" : "+";

    return {
      diff,
      percent,
      isDown,
      formattedLabel:
        diff === 0
          ? "Stabil (0%)"
          : `${sign}${percent}% (${directionText} ${Math.abs(diff)} kasus)`,
    };
  },

  /**
   * Mengumpulkan seluruh statistik agregat dashboard secara atomik & real-time
   */
  async getDashboardStats(serverNow: Date = new Date()): Promise<DashboardStatsResult> {
    // 1. Siapkan baseline 6 bulan kalender
    const monthlyBuckets = this.generateSixMonthsBaseline(serverNow);
    const startDate = new Date(monthlyBuckets[0].year, monthlyBuckets[0].monthIndex, 1, 0, 0, 0, 0);

    // 2. Jalankan seluruh agregasi database secara paralel
    const [
      totalSiswa,
      counselingCounts,
      violationsSinceStart,
      totalViolationRecords,
      criticalStudentsCount,
      activeSchedulesCount,
      pendingAngketReviewCount,
      assessmentStats,
      allViolationsForCategory,
      followUpBreakdown,
    ] = await Promise.all([
      dashboardRepository.countTotalSiswa(),
      dashboardRepository.getCounselingStatusCounts(),
      dashboardRepository.getViolationsSince(startDate),
      dashboardRepository.countTotalViolations(),
      dashboardRepository.countCriticalStudents(25), // Ambang batas Peringatan 1 Tata Tertib
      dashboardRepository.countActiveSchedules(serverNow),
      dashboardRepository.countPendingAngketReview(),
      dashboardRepository.getAssessmentCompletionStats(),
      dashboardRepository.getAllViolationsForCategoryDistribution(),
      dashboardRepository.getViolationFollowUpBreakdown(),
    ]);

    // 3. Masukkan catatan pelanggaran aktual ke dalam bucket 6 bulan
    for (const v of violationsSinceStart) {
      const vDate = new Date(v.createdAt);
      if (isNaN(vDate.getTime())) continue;

      const y = vDate.getFullYear();
      const m = String(vDate.getMonth() + 1).padStart(2, "0");
      const key = `${y}-${m}`;

      const bucket = monthlyBuckets.find((b) => b.monthKey === key);
      if (bucket) {
        bucket.count += 1;
        bucket.totalPoin += v.poin || 0;
      }
    }

    // 4. Kalkulasi metrik tren
    const totalTrendCases = monthlyBuckets.reduce((acc, b) => acc + b.count, 0);
    const averagePerMonth = Number((totalTrendCases / 6).toFixed(1));
    const currentMonthCases = monthlyBuckets[5]?.count ?? 0;
    const prevMonthCases = monthlyBuckets[4]?.count ?? 0;
    const monthDiff = this.calculateMonthDiff(currentMonthCases, prevMonthCases);
    const periodLabel = this.formatPeriodLabel(monthlyBuckets);

    // 5. Klasifikasi distribusi kategori pelanggaran dari seluruh catatan database
    let kedisiplinan = 0;
    let tataTertib = 0;
    let lainnya = 0;

    for (const v of allViolationsForCategory) {
      const text = (v.jenisPelanggaran || "").toLowerCase();
      if (
        text.includes("disiplin") ||
        text.includes("bolos") ||
        text.includes("terlambat") ||
        text.includes("alpa") ||
        text.includes("hadir")
      ) {
        kedisiplinan++;
      } else if (
        text.includes("seragam") ||
        text.includes("atribut") ||
        text.includes("rambut") ||
        text.includes("tertib") ||
        text.includes("kelas")
      ) {
        tataTertib++;
      } else {
        lainnya++;
      }
    }

    // 6. Hitung persentase keterisian asesmen
    const safeTotalSiswa = Math.max(assessmentStats.totalSiswa, 1);
    const angketPercent = Math.round((assessmentStats.totalMengisiAngket / safeTotalSiswa) * 100);
    const gayaBelajarPercent = Math.round((assessmentStats.totalMengisiVak / safeTotalSiswa) * 100);
    const minatBakatPercent = Math.round((assessmentStats.totalMengisiRiasec / safeTotalSiswa) * 100);

    // 7. Hitung persentase konseling selesai
    const counselingCompletionRate =
      counselingCounts.total > 0
        ? Math.round((counselingCounts.completed / counselingCounts.total) * 100)
        : 0;

    // Status selesai pembinaan berasal langsung dari agregasi database otoritatif
    const completedFollowUp = followUpBreakdown.selesai;

    return {
      overview: {
        totalSiswa,
        konselingPending: counselingCounts.pending,
        activeSchedulesCount,
        criticalStudentsCount,
        totalViolationRecords,
        pendingAngketReviewCount,
      },
      counseling: {
        ...counselingCounts,
        completionRate: counselingCompletionRate,
      },
      assessments: {
        totalSiswa: assessmentStats.totalSiswa,
        angketMasalahCount: assessmentStats.totalMengisiAngket,
        angketMasalahPercent: angketPercent,
        gayaBelajarCount: assessmentStats.totalMengisiVak,
        gayaBelajarPercent: gayaBelajarPercent,
        minatBakatCount: assessmentStats.totalMengisiRiasec,
        minatBakatPercent: minatBakatPercent,
      },
      violations: {
        totalRecords: totalViolationRecords,
        criticalCount: criticalStudentsCount,
        completedFollowUp,
        followUpBreakdown,
        categories: {
          kedisiplinan,
          tataTertib,
          lainnya,
        },
        trend: {
          periodLabel,
          startMonthLabel: monthlyBuckets[0]?.monthLabel || "",
          endMonthLabel: monthlyBuckets[5]?.monthLabel || "",
          months: monthlyBuckets,
          totalCases: totalTrendCases,
          averagePerMonth,
          monthDiff,
        },
      },
      serverTimestamp: serverNow.toISOString(),
    };
  },
};
