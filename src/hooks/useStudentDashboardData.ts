"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApiClient, ApiError } from "@/hooks/useApiClient";

export interface StudentProfile {
  id: number;
  nisn: string;
  nama: string | null;
  jenisKelamin: string | null;
  rombel: string | null;
  totalPoin: number;
}

export interface CounselingSession {
  id: number;
  siswaId: number;
  tanggal: string; // Format: "YYYY-MM-DD"
  jam: string;
  topik: string;
  keluhan: string | null;
  status: "PENDING" | "DISETUJUI" | "DITOLAK" | "SELESAI";
  statusLabel?: string;
  badgeVariant?: string;
  catatanGuruBK: string | null;
  createdAt: string;
  counselor?: {
    id: number;
    nip: string | null;
    nama: string;
  } | null;
}

export interface AssessmentDetail {
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  completedAt: string | null;
  summary: string | null;
}

export interface StudentAssessmentsState {
  minatBakat: AssessmentDetail;
  angketMasalah: AssessmentDetail;
  gayaBelajar: AssessmentDetail;
}

export function useStudentDashboardData() {
  const router = useRouter();
  const { get } = useApiClient();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [counseling, setCounseling] = useState<CounselingSession | null>(null);
  const [counselingLoading, setCounselingLoading] = useState(true);
  const [counselingError, setCounselingError] = useState<string | null>(null);

  const [assessments, setAssessments] = useState<StudentAssessmentsState>({
    minatBakat: { isCompleted: false, isLoading: true, error: null, completedAt: null, summary: null },
    angketMasalah: { isCompleted: false, isLoading: true, error: null, completedAt: null, summary: null },
    gayaBelajar: { isCompleted: false, isLoading: true, error: null, completedAt: null, summary: null },
  });

  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [profileRes, counselingRes, mbRes, amRes, gbRes] = await Promise.allSettled([
        get<StudentProfile>("/api/profile"),
        get<CounselingSession[]>("/api/siswa/konseling/history"),
        get<{ id: number; kodeTop3: string; rekomendasi: string; createdAt: string }>(
          "/api/siswa/assessment/minat-bakat/result"
        ),
        get<{ id: number; statusReview: string; createdAt: string }>(
          "/api/siswa/assessment/angket-masalah/result"
        ),
        get<{ id: number; dominan: string; createdAt: string }>(
          "/api/siswa/assessment/gaya-belajar/result"
        ),
      ]);

      // 1. Profil Siswa
      if (profileRes.status === "fulfilled") {
        if (profileRes.value.data) {
          setProfile(profileRes.value.data);
          setProfileError(null);
        }
      } else {
        const err = profileRes.reason;
        if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
          router.replace("/login");
          return;
        }
        setProfileError(err instanceof Error ? err.message : "Gagal memuat profil siswa.");
      }
      setProfileLoading(false);

      // 2. Konseling Siswa
      if (counselingRes.status === "fulfilled") {
        const data = counselingRes.value.data;
        if (Array.isArray(data)) {
          const active =
            data.find((s) => s.status === "DISETUJUI") ||
            data.find((s) => s.status === "PENDING") ||
            (data.length > 0 ? data[0] : null);
          setCounseling(active);
        } else {
          setCounseling(null);
        }
        setCounselingError(null);
      } else {
        setCounselingError("Gagal memuat status konseling.");
      }
      setCounselingLoading(false);

      // 3. Status 3 Asesmen
      setAssessments({
        minatBakat: {
          isCompleted: mbRes.status === "fulfilled" && Boolean(mbRes.value.data),
          isLoading: false,
          error: mbRes.status === "rejected" ? "Gagal memuat data" : null,
          completedAt:
            mbRes.status === "fulfilled" && mbRes.value.data?.createdAt
              ? mbRes.value.data.createdAt
              : null,
          summary:
            mbRes.status === "fulfilled" && mbRes.value.data?.rekomendasi
              ? `Rekomendasi: ${mbRes.value.data.rekomendasi}`
              : null,
        },
        angketMasalah: {
          isCompleted: amRes.status === "fulfilled" && Boolean(amRes.value.data),
          isLoading: false,
          error: amRes.status === "rejected" ? "Gagal memuat data" : null,
          completedAt:
            amRes.status === "fulfilled" && amRes.value.data?.createdAt
              ? amRes.value.data.createdAt
              : null,
          summary:
            amRes.status === "fulfilled" && amRes.value.data?.statusReview
              ? `Status Review: ${amRes.value.data.statusReview}`
              : null,
        },
        gayaBelajar: {
          isCompleted: gbRes.status === "fulfilled" && Boolean(gbRes.value.data),
          isLoading: false,
          error: gbRes.status === "rejected" ? "Gagal memuat data" : null,
          completedAt:
            gbRes.status === "fulfilled" && gbRes.value.data?.createdAt
              ? gbRes.value.data.createdAt
              : null,
          summary:
            gbRes.status === "fulfilled" && gbRes.value.data?.dominan
              ? `Tipe Dominan: ${gbRes.value.data.dominan}`
              : null,
        },
      });
    } catch {
      // Fallback
    } finally {
      isFetchingRef.current = false;
    }
  }, [get, router]);

  const refresh = useCallback(() => {
    setProfileLoading(true);
    setCounselingLoading(true);
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Jalankan pengambilan data pertama
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    // Polling setiap 60 detik untuk memperbarui status
    const interval = setInterval(() => {
      void fetchData();
    }, 60000);

    // Refresh saat tab difokuskan kembali
    const handleFocus = () => {
      void fetchData();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchData]);

  return {
    profile,
    profileLoading,
    profileError,
    counseling,
    counselingLoading,
    counselingError,
    assessments,
    refresh,
  };
}
