"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Search,
  PlusCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  X,
} from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";
import {
  StatusTindakLanjutKasus,
  STATUS_TINDAK_LANJUT_META,
} from "@/constants/pelanggaran.constant";
import { BkFollowUpDetailModal } from "@/components/bk/dashboard/BkFollowUpDetailModal";

interface PelanggaranListItem {
  id: number;
  jenisPelanggaran: string;
  poin: number;
  keterangan: string | null;
  statusTindakLanjut: StatusTindakLanjutKasus;
  statusLabel: string;
  badgeVariant: "neutral" | "warning" | "info" | "success";
  createdAt: string;
  totalTindakan: number;
  counselor: { id: number; nama: string } | null;
  siswa: {
    id: number;
    nisn: string;
    nama: string | null;
    rombel: string | null;
    totalPoin: number;
    sanksi: {
      tahap: string;
      rentang: string;
      tindakan: string[];
    };
  };
  tindakanTerakhir: {
    id: number;
    bentukTindakan: string;
    bentukLabel: string;
    statusPelaksanaan: string;
    tanggalTindakan: string;
    catatan: string;
  } | null;
}

interface FollowUpStats {
  belumDitangani: number;
  dalamPembinaan: number;
  selesai: number;
  dibatalkan: number;
  total: number;
}

export default function BkPelanggaranPage() {
  const { get, post } = useApiClient();

  // State Data
  const [items, setItems] = useState<PelanggaranListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState<FollowUpStats | null>(null);

  // Filter & Search
  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [rombelFilter, setRombelFilter] = useState<string>("");

  // Loading & Error
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Detail & Tindak Lanjut
  const [selectedPelanggaranId, setSelectedPelanggaranId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Modal Catat Pelanggaran Baru
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createSiswaId, setCreateSiswaId] = useState<string>("");
  const [createJenis, setCreateJenis] = useState<string>("");
  const [createPoin, setCreatePoin] = useState<number>(5);
  const [createKeterangan, setCreateKeterangan] = useState<string>("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Refetch helper
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (rombelFilter.trim()) params.set("rombel", rombelFilter.trim());
      if (search.trim()) params.set("search", search.trim());

      const [listRes, statsRes] = await Promise.all([
        get<PelanggaranListItem[]>(`/api/bk/pelanggaran?${params.toString()}`),
        get<FollowUpStats>("/api/bk/pelanggaran/tindak-lanjut/stats"),
      ]);

      if (listRes && Array.isArray(listRes.data)) {
        setItems(listRes.data);
        const pag = listRes.pagination as { total: number; page: number; limit: number } | undefined;
        const totalCount = pag?.total ?? listRes.data.length;
        setTotal(totalCount);
        setTotalPages(Math.ceil(totalCount / limit) || 1);
      }

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, page, limit, selectedStatus, rombelFilter, search]);

  useEffect(() => {
    let isCancelled = false;
    const runFetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());
        if (selectedStatus !== "ALL") params.set("status", selectedStatus);
        if (rombelFilter.trim()) params.set("rombel", rombelFilter.trim());
        if (search.trim()) params.set("search", search.trim());

        const [listRes, statsRes] = await Promise.all([
          get<PelanggaranListItem[]>(`/api/bk/pelanggaran?${params.toString()}`),
          get<FollowUpStats>("/api/bk/pelanggaran/tindak-lanjut/stats"),
        ]);

        if (!isCancelled && listRes && Array.isArray(listRes.data)) {
          setItems(listRes.data);
          const pag = listRes.pagination as { total: number; page: number; limit: number } | undefined;
          const totalCount = pag?.total ?? listRes.data.length;
          setTotal(totalCount);
          setTotalPages(Math.ceil(totalCount / limit) || 1);
        }

        if (!isCancelled && statsRes && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(formatErrorMessage(err));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    runFetch();

    return () => {
      isCancelled = true;
    };
  }, [get, page, limit, selectedStatus, rombelFilter, search]);

  // Handle open modal tindak lanjut
  const handleOpenFollowUp = (id: number) => {
    setSelectedPelanggaranId(id);
    setIsDetailModalOpen(true);
  };

  // Handle submit create pelanggaran
  const handleCreatePelanggaran = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setCreateError(null);

    const sId = parseInt(createSiswaId, 10);
    if (isNaN(sId) || sId <= 0) {
      setCreateError("ID Siswa tidak valid");
      setIsSubmittingCreate(false);
      return;
    }

    try {
      await post("/api/bk/pelanggaran", {
        siswaId: sId,
        jenisPelanggaran: createJenis.trim(),
        poin: createPoin,
        keterangan: createKeterangan.trim() || undefined,
      });

      setIsCreateModalOpen(false);
      setCreateSiswaId("");
      setCreateJenis("");
      setCreatePoin(5);
      setCreateKeterangan("");
      await fetchData();
    } catch (err: unknown) {
      setCreateError(formatErrorMessage(err));
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const getStatusBadgeStyle = (status: StatusTindakLanjutKasus) => {
    const meta = STATUS_TINDAK_LANJUT_META[status];
    switch (meta?.badgeVariant) {
      case "warning":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3.5 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8 space-y-5">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/bk"
              className="text-xs font-semibold text-[#5b6b85] hover:text-[#071a3a] dark:text-[#829dbf] dark:hover:text-white"
            >
              Dashboard
            </Link>
            <span className="text-xs text-[#5b6b85] dark:text-[#829dbf]">/</span>
            <span className="text-xs font-bold text-[#071a3a] dark:text-white">
              Pelanggaran & Tindak Lanjut
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#071a3a] dark:text-white mt-1">
            Manajemen Pelanggaran & Tindak Lanjut
          </h1>
          <p className="text-xs sm:text-sm text-[#5b6b85] dark:text-[#829dbf] mt-0.5">
            Pencatatan pelanggaran, penanganan kasus pembinaan resmi, dan evaluasi DSS Pasal 8
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchData()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#071a3a] hover:bg-slate-50 dark:border-[#173456] dark:bg-[#0d2138] dark:text-white transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#071a3a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2e63] dark:bg-[#f4c542] dark:text-[#071a3a] transition-colors shadow-sm"
          >
            <PlusCircle size={15} />
            <span>Catat Pelanggaran</span>
          </button>
        </div>
      </div>

      {/* 4 STAT KARTU RINGKASAN STATUS KASUS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Belum Ditangani */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Belum Ditangani
            </span>
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-amber-900 dark:text-amber-200">
            {stats ? stats.belumDitangani : "-"}
          </p>
          <p className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-400/80">
            Perlu atensi awal Guru BK
          </p>
        </div>

        {/* Dalam Pembinaan */}
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
              Dalam Pembinaan
            </span>
            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-blue-900 dark:text-blue-200">
            {stats ? stats.dalamPembinaan : "-"}
          </p>
          <p className="mt-0.5 text-[11px] text-blue-700/80 dark:text-blue-400/80">
            Tindakan sedang berjalan
          </p>
        </div>

        {/* Selesai */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Kasus Selesai
            </span>
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-emerald-900 dark:text-emerald-200">
            {stats ? stats.selesai : "-"}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            Pembinaan tuntas (poin tetap)
          </p>
        </div>

        {/* Dibatalkan / Total */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#173456] dark:bg-[#0d2138]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Seluruh Kasus
            </span>
            <FileText size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-[#071a3a] dark:text-white">
            {stats ? stats.total : "-"}
          </p>
          <p className="mt-0.5 text-[11px] text-[#5b6b85] dark:text-[#829dbf]">
            {stats?.dibatalkan ?? 0} kasus dibatalkan
          </p>
        </div>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-[#173456] dark:bg-[#0d2138]">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa, NISN, atau jenis pelanggaran..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] pl-9 pr-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:bg-white focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
          />
        </div>

        {/* Filter Rombel */}
        <div className="w-full sm:w-36">
          <input
            type="text"
            placeholder="Filter kelas..."
            value={rombelFilter}
            onChange={(e) => {
              setRombelFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:bg-white focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
          />
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Semua Status" },
            { id: "BELUM_DITANGANI", label: "Belum Ditangani" },
            { id: "DALAM_PEMBINAAN", label: "Dalam Pembinaan" },
            { id: "SELESAI", label: "Selesai" },
            { id: "DIBATALKAN", label: "Dibatalkan" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setSelectedStatus(st.id);
                setPage(1);
              }}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                selectedStatus === st.id
                  ? "bg-[#071a3a] text-white dark:bg-[#f4c542] dark:text-[#071a3a]"
                  : "bg-slate-100 text-[#5b6b85] hover:bg-slate-200 dark:bg-[#173456] dark:text-[#829dbf] dark:hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchData()}
            className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* TABEL DAFTAR PELANGGARAN */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-[#173456] dark:bg-[#0d2138]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-[#f8fafc] text-[11px] font-bold uppercase tracking-wider text-[#5b6b85] dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf]">
              <tr>
                <th className="px-4 py-3.5">Siswa</th>
                <th className="px-4 py-3.5">Pelanggaran & Poin</th>
                <th className="px-4 py-3.5">Akumulasi DSS</th>
                <th className="px-4 py-3.5">Status Kasus</th>
                <th className="px-4 py-3.5">Tindakan Terakhir</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#173456]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700 mt-1" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-700 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <CheckCircle2 size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-sm font-bold text-[#071a3a] dark:text-white">
                      Tidak ada catatan pelanggaran ditemukan
                    </p>
                    <p className="mt-0.5 text-xs text-[#5b6b85] dark:text-[#829dbf]">
                      Sesuaikan kata kunci pencarian atau filter status untuk melihat data lain.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#102943]/60 transition-colors"
                  >
                    {/* Siswa */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#071a3a] dark:text-white">
                        {item.siswa.nama || "Siswa SMAN 26"}
                      </div>
                      <div className="text-[11px] text-[#5b6b85] dark:text-[#829dbf]">
                        {item.siswa.rombel || "Rombel -"} | NISN: {item.siswa.nisn}
                      </div>
                    </td>

                    {/* Pelanggaran */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {item.jenisPelanggaran}
                      </div>
                      <div className="text-[11px] font-bold text-red-600 dark:text-red-400">
                        +{item.poin} Poin
                        <span className="text-slate-400 font-normal ml-1">
                          • {new Date(item.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </td>

                    {/* Akumulasi DSS */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#071a3a] dark:text-white">
                          {item.siswa.totalPoin} Poin
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-bold text-[#b85b08] dark:text-amber-300">
                        {item.siswa.sanksi.tahap}
                      </span>
                    </td>

                    {/* Status Kasus */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadgeStyle(
                          item.statusTindakLanjut
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.statusLabel}
                      </span>
                    </td>

                    {/* Tindakan Terakhir */}
                    <td className="px-4 py-3.5">
                      {item.tindakanTerakhir ? (
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.tindakanTerakhir.bentukLabel}
                          </p>
                          <p className="text-[10.5px] text-[#5b6b85] dark:text-[#829dbf] line-clamp-1">
                            {item.tindakanTerakhir.catatan}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] italic text-slate-400">Belum ada tindakan</span>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium">
                        ({item.totalTindakan} log tindakan)
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenFollowUp(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#071a3a] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#0c2e63] dark:bg-[#f4c542] dark:text-[#071a3a]"
                      >
                        <History size={13} />
                        <span>Tindak Lanjut</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#f8fafc] px-4 py-3 text-xs text-[#5b6b85] dark:border-[#173456] dark:bg-[#071526] dark:text-[#829dbf]">
          <span>
            Menampilkan halaman {page} dari {totalPages} ({total} kasus)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-[#173456] dark:bg-[#0d2138] dark:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white p-1 text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-[#173456] dark:bg-[#0d2138] dark:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL & TINDAK LANJUT PELANGGARAN */}
      <BkFollowUpDetailModal
        isOpen={isDetailModalOpen}
        pelanggaranId={selectedPelanggaranId}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPelanggaranId(null);
        }}
        onSuccess={fetchData}
      />

      {/* MODAL CATAT PELANGGARAN BARU */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-[#173456] dark:bg-[#0d2138]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-[#173456]">
              <h3 className="text-base font-bold text-[#071a3a] dark:text-white">
                Catat Pelanggaran Siswa Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#173456]"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreatePelanggaran} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#071a3a] dark:text-white mb-1">
                  ID Siswa Database (Contoh: 1)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Masukkan ID Siswa..."
                  value={createSiswaId}
                  onChange={(e) => setCreateSiswaId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071a3a] dark:text-white mb-1">
                  Jenis Pelanggaran / Pasal Tata Tertib
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keterlambatan masuk sekolah > 15 menit"
                  value={createJenis}
                  onChange={(e) => setCreateJenis(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071a3a] dark:text-white mb-1">
                  Bobot Poin (1 - 100)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={createPoin}
                  onChange={(e) => setCreatePoin(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-[#071a3a] dark:text-white mb-1">
                  Keterangan Kejadian (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Konteks atau keterangan tambahan..."
                  value={createKeterangan}
                  onChange={(e) => setCreateKeterangan(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#173456] dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#071a3a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2e63] disabled:opacity-50 dark:bg-[#f4c542] dark:text-[#071a3a]"
                >
                  {isSubmittingCreate ? "Menyimpan..." : "Simpan & Evaluasi DSS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
