"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient, ApiError } from "@/hooks/useApiClient";
import { DashboardStatsResult, MonthlyTrendBucket } from "@/services/dashboard.service";

export interface CounselorProfile {
  id: number;
  nip: string | null;
  nama: string;
  username: string;
}

export interface BkCounselingItem {
  id: number;
  siswaId: number;
  tanggal: string;
  jam: string;
  topik: string;
  keluhan: string | null;
  status: "PENDING" | "DISETUJUI" | "DITOLAK" | "SELESAI";
  catatanGuruBK: string | null;
  createdAt: string;
  siswa?: {
    id: number;
    nama_siswa: string | null;
    rombel: string | null;
    nisn: string;
  };
}

export interface BkScheduleItem {
  id: number;
  tipe: "ANGKET_MASALAH" | "GAYA_BELAJAR" | "MINAT_BAKAT";
  judul: string;
  deskripsi: string | null;
  tanggalMulai: string;
  tanggalSelesai: string;
  targetTingkat: string | null;
  targetRombel: string | null;
  isActive: boolean;
}

export interface BkAssessmentRekap {
  totalSiswa: number;
  statistik: {
    totalMengisiVak: number;
    totalMengisiRiasec: number;
    totalMengisiAngket: number;
  };
  siswa?: Array<{
    id: number;
    nama?: string;
    angketMasalah?: {
      sudah: boolean;
      statusReview?: string;
    };
  }>;
}

export interface BkViolationStudentItem {
  id: number;
  nama: string | null;
  rombel: string | null;
  totalPoin: number;
  jumlahKasus: number;
  statusSanksi: string;
  statusKritis: boolean;
  tindakan: string[];
  riwayatTerbaru: Array<{
    jenis: string;
    poin: number;
    tanggal: string;
    guruBk: string | null;
  }>;
}

export interface BkDashboardErrors {
  auth: string | null;
  stats: string | null;
  konselingList: string | null;
  schedules: string | null;
  violationStudents: string | null;
}

export interface BkDashboardState {
  profile: CounselorProfile | null;
  // 1. Statistik Ringkasan Utama (Agregat Database Otoritatif)
  totalSiswa: number;
  konselingPendingCount: number;
  konselingApprovedCount: number;
  konselingCompletedCount: number;
  konselingRejectedCount: number;
  counselingTotalCount: number;
  counselingCompletionRate: number;
  activeSchedulesCount: number;
  criticalStudentsCount: number;
  totalViolationRecords: number;
  pendingAngketReviewCount: number;
  // 2. Persentase Keterisian Asesmen
  assessmentStats: {
    angketMasalahCount: number;
    angketMasalahPercent: number;
    gayaBelajarCount: number;
    gayaBelajarPercent: number;
    minatBakatCount: number;
    minatBakatPercent: number;
  };
  // 3. Distribusi Kategori Pelanggaran
  violationCategories: {
    kedisiplinan: number;
    tataTertib: number;
    lainnya: number;
  };
  // 3b. Rekapitulasi Status Tindak Lanjut Aktual Database
  completedFollowUpCount: number;
  followUpBreakdown: {
    belumDitangani: number;
    dalamPembinaan: number;
    selesai: number;
    dibatalkan: number;
  };
  // 4. Metrik Tren 6 Bulan Kalender
  violationMonthlyTrend: MonthlyTrendBucket[];
  trendPeriodLabel: string;
  trendTotalCases: number;
  trendAveragePerMonth: number;
  trendMonthDiff: {
    diff: number;
    percent: number | null;
    isDown: boolean;
    formattedLabel: string;
  } | null;
  // 5. Data List Spesifik (Untuk Kartu Perlu Perhatian & DSS Ranking)
  konselingList: BkCounselingItem[];
  schedules: BkScheduleItem[];
  violationStudents: BkViolationStudentItem[];
  // Status Pemuatan & Error Granular
  isLoading: boolean;
  isRefreshing: boolean;
  errors: BkDashboardErrors;
  hasAnyError: boolean;
  error: string | null; // Pesan error gabungan jika ada
}

export function useBkDashboardData() {
  const router = useRouter();
  const { get } = useApiClient();

  const [state, setState] = useState<BkDashboardState>({
    profile: null,
    totalSiswa: 0,
    konselingPendingCount: 0,
    konselingApprovedCount: 0,
    konselingCompletedCount: 0,
    konselingRejectedCount: 0,
    counselingTotalCount: 0,
    counselingCompletionRate: 0,
    activeSchedulesCount: 0,
    criticalStudentsCount: 0,
    totalViolationRecords: 0,
    pendingAngketReviewCount: 0,
    assessmentStats: {
      angketMasalahCount: 0,
      angketMasalahPercent: 0,
      gayaBelajarCount: 0,
      gayaBelajarPercent: 0,
      minatBakatCount: 0,
      minatBakatPercent: 0,
    },
    violationCategories: {
      kedisiplinan: 0,
      tataTertib: 0,
      lainnya: 0,
    },
    completedFollowUpCount: 0,
    followUpBreakdown: {
      belumDitangani: 0,
      dalamPembinaan: 0,
      selesai: 0,
      dibatalkan: 0,
    },
    violationMonthlyTrend: [],
    trendPeriodLabel: "6 Bulan Terakhir",
    trendTotalCases: 0,
    trendAveragePerMonth: 0,
    trendMonthDiff: null,
    konselingList: [],
    schedules: [],
    violationStudents: [],
    isLoading: true,
    isRefreshing: false,
    errors: {
      auth: null,
      stats: null,
      konselingList: null,
      schedules: null,
      violationStudents: null,
    },
    hasAnyError: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      // Jika request sedang berjalan, batalkan controller sebelumnya dan mulai baru
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      isFetchingRef.current = true;
      setState((prev) => ({
        ...prev,
        isLoading: prev.profile === null && !isManualRefresh,
        isRefreshing: isManualRefresh,
      }));

      try {
        // Eksekusi request paralel dengan penanganan per endpoint
        const [
          meRes,
          statsRes,
          konselingRes,
          jadwalRes,
          rekapPelanggaranRes,
        ] = await Promise.allSettled([
          get<{
            user: {
              id: number;
              username: string;
              role: string;
              counselor?: { id: number; nip: string | null; nama_counselor: string };
            };
          }>("/api/auth/me"),
          get<DashboardStatsResult>("/api/bk/dashboard/stats"),
          get<BkCounselingItem[]>("/api/bk/konseling?status=PENDING&limit=10&page=1"),
          get<BkScheduleItem[]>("/api/bk/assessment/jadwal"),
          get<BkViolationStudentItem[]>("/api/bk/rekap/pelanggaran?limit=10&page=1"),
        ]);

        // Cek apakah request telah dibatalkan
        if (controller.signal.aborted) return;

        const nextErrors: BkDashboardErrors = {
          auth: null,
          stats: null,
          konselingList: null,
          schedules: null,
          violationStudents: null,
        };

        // 1. Verifikasi Profil Guru BK & Hak Akses
        let profile = stateRef.current.profile;
        if (meRes.status === "fulfilled" && meRes.value.data?.user) {
          const u = meRes.value.data.user;
          if (u.role !== "BK") {
            router.replace("/siswa");
            return;
          }
          profile = {
            id: u.counselor?.id || u.id,
            nip: u.counselor?.nip || null,
            nama: u.counselor?.nama_counselor || "Guru BK",
            username: u.username,
          };
        } else if (meRes.status === "rejected") {
          const err = meRes.reason;
          if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
            router.replace("/login");
            return;
          }
          nextErrors.auth = "Gagal memverifikasi akun Guru BK.";
        }

        // 2. Statistik Agregat Backend Otoritatif
        let stats: DashboardStatsResult | null = null;
        if (statsRes.status === "fulfilled" && statsRes.value.data) {
          stats = statsRes.value.data;
        } else if (statsRes.status === "rejected") {
          nextErrors.stats = "Gagal memuat agregasi statistik database.";
        }

        // 3. Daftar Sesi Konseling Pending (untuk Panel Perhatian)
        let konselingList = stateRef.current.konselingList;
        if (konselingRes.status === "fulfilled") {
          const list = konselingRes.value.data ?? (konselingRes.value as { Metadata?: unknown }).Metadata;
          if (Array.isArray(list)) {
            konselingList = list as BkCounselingItem[];
          }
        } else if (konselingRes.status === "rejected") {
          nextErrors.konselingList = "Gagal memuat daftar permohonan konseling.";
        }

        // 4. Daftar Jadwal Asesmen (untuk Panel Perhatian)
        let schedules = stateRef.current.schedules;
        if (jadwalRes.status === "fulfilled" && Array.isArray(jadwalRes.value.data)) {
          schedules = jadwalRes.value.data;
        } else if (jadwalRes.status === "rejected") {
          nextErrors.schedules = "Gagal memuat daftar jadwal asesmen.";
        }

        // 5. Daftar Siswa Kritis & Pelanggaran (untuk Panel Perhatian & DSS)
        let violationStudents = stateRef.current.violationStudents;
        if (rekapPelanggaranRes.status === "fulfilled") {
          const list = rekapPelanggaranRes.value.data ?? (rekapPelanggaranRes.value as { Metadata?: unknown }).Metadata;
          if (Array.isArray(list)) {
            violationStudents = list as BkViolationStudentItem[];
          }
        } else if (rekapPelanggaranRes.status === "rejected") {
          nextErrors.violationStudents = "Gagal memuat daftar siswa perlu tindak lanjut.";
        }

        // Periksa apakah ada error di salah satu sumber data
        const errorMessages = Object.values(nextErrors).filter(Boolean) as string[];
        const hasAnyError = errorMessages.length > 0;
        const combinedErrorMessage = hasAnyError ? errorMessages.join(" • ") : null;

        setState((prev) => ({
          ...prev,
          profile: profile ?? prev.profile,
          // Update data jika stats berhasil diambil
          totalSiswa: stats ? stats.overview.totalSiswa : prev.totalSiswa,
          konselingPendingCount: stats ? stats.counseling.pending : prev.konselingPendingCount,
          konselingApprovedCount: stats ? stats.counseling.approved : prev.konselingApprovedCount,
          konselingCompletedCount: stats ? stats.counseling.completed : prev.konselingCompletedCount,
          konselingRejectedCount: stats ? stats.counseling.rejected : prev.konselingRejectedCount,
          counselingTotalCount: stats ? stats.counseling.total : prev.counselingTotalCount,
          counselingCompletionRate: stats ? stats.counseling.completionRate : prev.counselingCompletionRate,
          activeSchedulesCount: stats ? stats.overview.activeSchedulesCount : prev.activeSchedulesCount,
          criticalStudentsCount: stats ? stats.overview.criticalStudentsCount : prev.criticalStudentsCount,
          totalViolationRecords: stats ? stats.overview.totalViolationRecords : prev.totalViolationRecords,
          pendingAngketReviewCount: stats ? stats.overview.pendingAngketReviewCount : prev.pendingAngketReviewCount,
          assessmentStats: stats ? stats.assessments : prev.assessmentStats,
          violationCategories: stats ? stats.violations.categories : prev.violationCategories,
          completedFollowUpCount: stats ? stats.violations.completedFollowUp : prev.completedFollowUpCount,
          followUpBreakdown: stats
            ? stats.violations.followUpBreakdown
            : prev.followUpBreakdown,
          violationMonthlyTrend: stats ? stats.violations.trend.months : prev.violationMonthlyTrend,
          trendPeriodLabel: stats ? stats.violations.trend.periodLabel : prev.trendPeriodLabel,
          trendTotalCases: stats ? stats.violations.trend.totalCases : prev.trendTotalCases,
          trendAveragePerMonth: stats ? stats.violations.trend.averagePerMonth : prev.trendAveragePerMonth,
          trendMonthDiff: stats ? stats.violations.trend.monthDiff : prev.trendMonthDiff,
          // Update list
          konselingList,
          schedules,
          violationStudents,
          // Status
          isLoading: false,
          isRefreshing: false,
          errors: nextErrors,
          hasAnyError,
          error: combinedErrorMessage,
        }));
      } catch (err) {
        if (controller.signal.aborted) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          hasAnyError: true,
          error: err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data dashboard BK.",
        }));
      } finally {
        isFetchingRef.current = false;
      }
    },
    [get, router]
  );

  useEffect(() => {
    void fetchDashboardData(false);

    // Revalidasi otomatis saat jendela aktif kembali
    const handleFocus = () => {
      void fetchDashboardData(true);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    return fetchDashboardData(true);
  }, [fetchDashboardData]);

  return {
    ...state,
    refresh,
  };
}
