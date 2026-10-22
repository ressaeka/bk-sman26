"use client";

import React, { useState, useEffect } from "react";
import { KonselingHistoryView } from "@/components/siswa/konseling/KonselingHistoryView";
import { KonselingItem } from "@/components/siswa/konseling/KonselingTypes";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";

export default function SiswaKonselingPage() {
  const { get } = useApiClient();
  const [sessions, setSessions] = useState<KonselingItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const response = await get<KonselingItem[]>("/api/siswa/konseling/history");

        if (!isMounted) return;

        if (!response.success || !response.data) {
          throw new Error(response.message || "Gagal memuat riwayat konseling.");
        }

        setSessions(response.data);
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = formatErrorMessage(err);
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [get, reloadKey]);

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <KonselingHistoryView
          sessions={sessions}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}
