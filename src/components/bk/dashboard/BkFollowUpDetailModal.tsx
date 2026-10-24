"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ArrowRightCircle,
  History,
  PlusCircle,
  Send,
} from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";
import {
  BentukTindakLanjut,
  StatusPelaksanaanTindakan,
  StatusTindakLanjutKasus,
} from "@/constants/pelanggaran.constant";

interface PelanggaranDetailResponse {
  pelanggaran: {
    id: number;
    jenisPelanggaran: string;
    poin: number;
    keterangan: string | null;
    statusTindakLanjut: StatusTindakLanjutKasus;
    statusLabel: string;
    badgeVariant: "neutral" | "warning" | "info" | "success";
    createdAt: string;
    guruBk: string | null;
  };
  siswa: {
    id: number;
    nisn: string;
    nipd: string | null;
    nama: string | null;
    jenisKelamin: string | null;
    rombel: string | null;
    totalPoin: number;
    dss: {
      sanksi: {
        tahap: string;
        tindakan: string[];
      };
      statusKritis: boolean;
    };
  };
  tindakLanjut: Array<{
    id: number;
    bentukTindakan: BentukTindakLanjut;
    bentukLabel: string;
    statusPelaksanaan: StatusPelaksanaanTindakan;
    tanggalTindakan: string;
    pihakTerlibat: string | null;
    catatan: string;
    tenggatEvaluasi: string | null;
    counselor: {
      id: number;
      nip: string | null;
      nama: string;
    } | null;
    createdAt: string;
  }>;
  totalTindakan: number;
}

interface BkFollowUpDetailModalProps {
  isOpen: boolean;
  pelanggaranId: number | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BkFollowUpDetailModal({
  isOpen,
  pelanggaranId,
  onClose,
  onSuccess,
}: BkFollowUpDetailModalProps) {
  const { get, post, patch } = useApiClient();

  const [data, setData] = useState<PelanggaranDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active section tab: 'riwayat' | 'tambah' | 'status'
  const [activeTab, setActiveTab] = useState<"riwayat" | "tambah" | "status">("riwayat");

  // Form tambah tindakan
  const [bentukTindakan, setBentukTindakan] = useState<BentukTindakLanjut>("PEMANGGILAN_SISWA");
  const [statusPelaksanaan, setStatusPelaksanaan] =
    useState<StatusPelaksanaanTindakan>("TERLAKSANA");
  const [tanggalTindakan, setTanggalTindakan] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );
  const [pihakTerlibat, setPihakTerlibat] = useState<string>("");
  const [catatan, setCatatan] = useState<string>("");
  const [tenggatEvaluasi, setTenggatEvaluasi] = useState<string>("");
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);
  const [actionFormError, setActionFormError] = useState<string | null>(null);

  // Form ubah status kasus
  const [targetStatus, setTargetStatus] = useState<StatusTindakLanjutKasus>("DALAM_PEMBINAAN");
  const [catatanPerubahan, setCatatanPerubahan] = useState<string>("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState<boolean>(false);
  const [statusFormError, setStatusFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reload detail data after mutation
  const reloadDetail = useCallback(async () => {
    if (!pelanggaranId) return;
    try {
      const res = await get<PelanggaranDetailResponse>(
        `/api/bk/pelanggaran/${pelanggaranId}/tindak-lanjut`
      );
      if (res && res.data) {
        setData(res.data);
        const current = res.data.pelanggaran.statusTindakLanjut;
        if (current === "BELUM_DITANGANI") {
          setTargetStatus("DALAM_PEMBINAAN");
        } else if (current === "DALAM_PEMBINAAN") {
          setTargetStatus("SELESAI");
        } else if (current === "SELESAI") {
          setTargetStatus("DALAM_PEMBINAAN");
        } else {
          setTargetStatus("BELUM_DITANGANI");
        }
      }
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    }
  }, [pelanggaranId, get]);

  useEffect(() => {
    if (!isOpen || !pelanggaranId) {
      return;
    }
    let isCancelled = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await get<PelanggaranDetailResponse>(
          `/api/bk/pelanggaran/${pelanggaranId}/tindak-lanjut`
        );
        if (!isCancelled && res?.data) {
          setData(res.data);
          const current = res.data.pelanggaran.statusTindakLanjut;
          if (current === "BELUM_DITANGANI") {
            setTargetStatus("DALAM_PEMBINAAN");
          } else if (current === "DALAM_PEMBINAAN") {
            setTargetStatus("SELESAI");
          } else if (current === "SELESAI") {
            setTargetStatus("DALAM_PEMBINAAN");
          } else {
            setTargetStatus("BELUM_DITANGANI");
          }
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

    fetchDetail();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, pelanggaranId, get]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Submit tindakan baru
  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pelanggaranId) return;
    setIsSubmittingAction(true);
    setActionFormError(null);

    try {
      await post(`/api/bk/pelanggaran/${pelanggaranId}/tindak-lanjut`, {
        bentukTindakan,
        statusPelaksanaan,
        tanggalTindakan,
        pihakTerlibat: pihakTerlibat.trim() || null,
        catatan: catatan.trim(),
        tenggatEvaluasi: tenggatEvaluasi.trim() || undefined,
      });

      setToastMessage("Tindakan pembinaan berhasil dicatat.");
      setCatatan("");
      setPihakTerlibat("");
      setTenggatEvaluasi("");
      setActiveTab("riwayat");
      await reloadDetail();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setActionFormError(formatErrorMessage(err));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Submit ubah status kasus
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pelanggaranId) return;

    const trimmedReason = catatanPerubahan.trim();
    if (trimmedReason.length < 5) {
      setStatusFormError("Alasan perubahan status wajib diisi minimal 5 karakter.");
      return;
    }

    setIsSubmittingStatus(true);
    setStatusFormError(null);

    try {
      await patch(`/api/bk/pelanggaran/${pelanggaranId}/tindak-lanjut`, {
        status: targetStatus,
        catatanPerubahan: trimmedReason,
      });

      setToastMessage("Status kasus berhasil diperbarui.");
      setCatatanPerubahan("");
      setActiveTab("riwayat");
      await reloadDetail();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setStatusFormError(formatErrorMessage(err));
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Valid status transitions based on current status
  const currentStatus = data?.pelanggaran.statusTindakLanjut;
  const getAvailableStatusOptions = () => {
    if (currentStatus === "BELUM_DITANGANI") {
      return [
        { value: "DALAM_PEMBINAAN", label: "Mulai Pembinaan (DALAM_PEMBINAAN)" },
        { value: "SELESAI", label: "Selesaikan Kasus Langsung (SELESAI)" },
        { value: "DIBATALKAN", label: "Batalkan Kasus (DIBATALKAN)" },
      ];
    }
    if (currentStatus === "DALAM_PEMBINAAN") {
      return [
        { value: "SELESAI", label: "Selesaikan Pembinaan (SELESAI)" },
        { value: "DIBATALKAN", label: "Batalkan Kasus (DIBATALKAN)" },
      ];
    }
    if (currentStatus === "SELESAI") {
      return [
        { value: "DALAM_PEMBINAAN", label: "Buka Kembali Kasus (DALAM_PEMBINAAN)" },
      ];
    }
    if (currentStatus === "DIBATALKAN") {
      return [];
    }
    return [];
  };

  const getStatusBadgeClass = (variant: string) => {
    switch (variant) {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-followup-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="relative flex w-full max-w-3xl flex-col max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all dark:border-[#1e3c60] dark:bg-[#0d2138] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-[#173456]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071a3a] text-[#f4c542] dark:bg-[#143356]">
              <History size={20} />
            </div>
            <div>
              <h2
                id="modal-followup-title"
                className="text-[16px] font-bold text-[#071a3a] dark:text-white"
              >
                Detail Kasus & Tindak Lanjut Pembinaan
              </h2>
              <p className="text-[12px] text-[#5b6b85] dark:text-[#829dbf]">
                Rekam jejak pembinaan resmi Bimbingan Konseling SMAN 26
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#173456] dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NOTIF TOAST JIKA ADA */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 text-[12.5px] font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {toastMessage}
            </span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 text-xs font-bold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* BODY CONTAINER DENGAN SCROLL */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-20 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
              <AlertCircle size={28} className="text-red-500" />
              <p className="mt-2 text-sm font-bold text-red-800 dark:text-red-300">{error}</p>
              <button
                type="button"
                onClick={reloadDetail}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
              >
                <RefreshCw size={12} />
                <span>Coba Lagi</span>
              </button>
            </div>
          ) : data ? (
            <>
              {/* KARTU RINGKASAN SISWA & PELANGGARAN */}
              <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4 dark:border-[#173456] dark:bg-[#071526]/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#071a3a] dark:text-white">
                        {data.siswa.nama || "Nama Siswa Tidak Tersedia"}
                      </span>
                      <span className="text-xs text-[#5b6b85] dark:text-[#829dbf]">
                        ({data.siswa.rombel || "Rombel -"})
                      </span>
                    </div>
                    <p className="text-[12px] text-[#5b6b85] dark:text-[#829dbf] mt-0.5">
                      NISN: {data.siswa.nisn} | Total Akumulasi:{" "}
                      <span className="font-bold text-[#071a3a] dark:text-white">
                        {data.siswa.totalPoin} Poin
                      </span>
                    </p>
                  </div>

                  {/* STATUS BADGE */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                        data.pelanggaran.badgeVariant
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {data.pelanggaran.statusLabel}
                    </span>
                  </div>
                </div>

                {/* DETAIL PELANGGARAN INI */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 border-t border-slate-200/80 pt-3 text-[12px] dark:border-slate-800">
                  <div>
                    <span className="text-[#5b6b85] dark:text-[#829dbf]">Pelanggaran:</span>
                    <p className="font-semibold text-[#071a3a] dark:text-white">
                      {data.pelanggaran.jenisPelanggaran}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#5b6b85] dark:text-[#829dbf]">Bobot Poin Kasus:</span>
                    <p className="font-bold text-red-600 dark:text-red-400">
                      +{data.pelanggaran.poin} Poin
                    </p>
                  </div>
                  <div>
                    <span className="text-[#5b6b85] dark:text-[#829dbf]">Tanggal Pelaporan:</span>
                    <p className="font-semibold text-[#071a3a] dark:text-white">
                      {new Date(data.pelanggaran.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {data.pelanggaran.keterangan && (
                  <p className="mt-2 text-[11.5px] italic text-[#5b6b85] dark:text-[#829dbf]">
                    &quot;{data.pelanggaran.keterangan}&quot;
                  </p>
                )}
              </div>

              {/* NAVIGASI TAB MODAL */}
              <div className="flex border-b border-slate-200 dark:border-[#173456]">
                <button
                  type="button"
                  onClick={() => setActiveTab("riwayat")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                    activeTab === "riwayat"
                      ? "border-[#071a3a] text-[#071a3a] dark:border-[#f4c542] dark:text-[#f4c542]"
                      : "border-transparent text-[#5b6b85] hover:text-[#071a3a] dark:text-[#829dbf] dark:hover:text-white"
                  }`}
                >
                  <History size={15} />
                  <span>Riwayat Tindakan ({data.totalTindakan})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("tambah")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                    activeTab === "tambah"
                      ? "border-[#071a3a] text-[#071a3a] dark:border-[#f4c542] dark:text-[#f4c542]"
                      : "border-transparent text-[#5b6b85] hover:text-[#071a3a] dark:text-[#829dbf] dark:hover:text-white"
                  }`}
                >
                  <PlusCircle size={15} />
                  <span>Catat Tindakan Baru</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("status")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                    activeTab === "status"
                      ? "border-[#071a3a] text-[#071a3a] dark:border-[#f4c542] dark:text-[#f4c542]"
                      : "border-transparent text-[#5b6b85] hover:text-[#071a3a] dark:text-[#829dbf] dark:hover:text-white"
                  }`}
                >
                  <ArrowRightCircle size={15} />
                  <span>Ubah Status Kasus</span>
                </button>
              </div>

              {/* KONTEN TAB 1: RIWAYAT KRONOLOGIS */}
              {activeTab === "riwayat" && (
                <div className="space-y-3">
                  {data.tindakLanjut.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-[#173456]">
                      <Clock size={28} className="mx-auto text-slate-400 dark:text-slate-600" />
                      <p className="mt-2 text-sm font-semibold text-[#071a3a] dark:text-white">
                        Belum ada tindakan pembinaan
                      </p>
                      <p className="mt-1 text-xs text-[#5b6b85] dark:text-[#829dbf]">
                        Kasus ini belum memiliki catatan tindakan resmi. Silakan tambahkan melalui tab &quot;Catat Tindakan Baru&quot;.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("tambah")}
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#071a3a] px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#0c2e63] dark:bg-[#f4c542] dark:text-[#071a3a]"
                      >
                        <PlusCircle size={14} />
                        <span>Mulai Catat Tindakan</span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-200 pl-4 space-y-4 ml-2 dark:border-[#173456]">
                      {data.tindakLanjut.map((t) => {
                        const isAudit = t.catatan.startsWith("[PERUBAHAN STATUS");
                        return (
                          <div
                            key={t.id}
                            className={`relative rounded-xl border p-3.5 transition-colors ${
                              isAudit
                                ? "border-dashed border-slate-300 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/40"
                                : "border-slate-200 bg-white shadow-xs dark:border-[#173456] dark:bg-[#071526]"
                            }`}
                          >
                            {/* Dot timeline */}
                            <span
                              className={`absolute -left-[23px] top-4.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0d2138] ${
                                t.catatan.startsWith("[AUDIT_STATUS]") || t.catatan.startsWith("[PERUBAHAN STATUS")
                                  ? "bg-slate-400"
                                  : t.statusPelaksanaan === "TERLAKSANA"
                                  ? "bg-emerald-500"
                                  : t.statusPelaksanaan === "DIRENCANAKAN"
                                  ? "bg-amber-400"
                                  : "bg-slate-400"
                              }`}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#071a3a] dark:text-white">
                                  {t.catatan.startsWith("[AUDIT_STATUS]") || t.catatan.startsWith("[PERUBAHAN STATUS")
                                    ? "Audit Perubahan Status Kasus"
                                    : t.bentukLabel}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                    t.catatan.startsWith("[AUDIT_STATUS]") || t.catatan.startsWith("[PERUBAHAN STATUS")
                                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                      : t.statusPelaksanaan === "TERLAKSANA"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : t.statusPelaksanaan === "DIRENCANAKAN"
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {t.catatan.startsWith("[AUDIT_STATUS]") || t.catatan.startsWith("[PERUBAHAN STATUS")
                                    ? "AUDIT TRAIL"
                                    : t.statusPelaksanaan}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-[#5b6b85] dark:text-[#829dbf] flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(t.tanggalTindakan).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <p className="mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                              {t.catatan}
                            </p>

                            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-[#5b6b85] dark:border-slate-800 dark:text-[#829dbf]">
                              {t.pihakTerlibat && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  Pihak: {t.pihakTerlibat}
                                </span>
                              )}
                              <span>
                                Konselor: {t.counselor?.nama || "Guru BK Terautentikasi"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* KONTEN TAB 2: FORM TAMBAH TINDAKAN */}
              {activeTab === "tambah" && (
                currentStatus === "SELESAI" || currentStatus === "DIBATALKAN" ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                      <p className="font-bold flex items-center gap-1.5 text-sm">
                        <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
                        Kasus Berstatus {currentStatus === "SELESAI" ? "Selesai" : "Dibatalkan"}
                      </p>
                      <p className="mt-2 leading-relaxed">
                        {currentStatus === "SELESAI"
                          ? "Tindakan pembinaan baru tidak dapat dicatat pada kasus yang sudah ditutup. Untuk melanjutkan pembinaan, silakan buka kembali kasus ini (ke status DALAM_PEMBINAAN) melalui tab 'Ubah Status Kasus'."
                          : "Kasus yang telah dibatalkan tidak dapat menerima penambahan tindakan pembinaan."}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab(currentStatus === "SELESAI" ? "status" : "riwayat")}
                        className="rounded-xl bg-[#071a3a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c2e63] dark:bg-[#f4c542] dark:text-[#071a3a]"
                      >
                        {currentStatus === "SELESAI" ? "Buka Tab Ubah Status" : "Kembali ke Riwayat"}
                      </button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleAddAction} className="space-y-3.5">
                  {actionFormError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{actionFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                        Bentuk Tindakan
                      </label>
                      <select
                        value={bentukTindakan}
                        onChange={(e) => setBentukTindakan(e.target.value as BentukTindakLanjut)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                      >
                        <option value="PEMANGGILAN_SISWA">Pemanggilan Siswa</option>
                        <option value="PEMANGGILAN_ORANG_TUA">Pemanggilan Orang Tua / Wali</option>
                        <option value="SURAT_PERNYATAAN">Penandatanganan Surat Pernyataan</option>
                        <option value="KONSELING_INDIVIDUAL">Konseling Individual</option>
                        <option value="PERTEMUAN_KASUS">Konferensi Kasus (Case Conference)</option>
                        <option value="SANKSI_EDUKATIF">Pemberian Sanksi Edukatif</option>
                        <option value="LAINNYA">Tindakan Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                        Status Pelaksanaan Tindakan
                      </label>
                      <select
                        value={statusPelaksanaan}
                        onChange={(e) =>
                          setStatusPelaksanaan(e.target.value as StatusPelaksanaanTindakan)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                      >
                        <option value="TERLAKSANA">TERLAKSANA (Sudah selesai dilakukan)</option>
                        <option value="DIRENCANAKAN">DIRENCANAKAN (Jadwal ke depan)</option>
                        <option value="BATAL_TERTUNDA">BATAL_TERTUNDA (Tertunda/batal)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                        Tanggal Tindakan (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalTindakan}
                        onChange={(e) => setTanggalTindakan(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                      >
                      </input>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                        Pihak yang Terlibat (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Wali Kelas X-A, Orang Tua"
                        value={pihakTerlibat}
                        onChange={(e) => setPihakTerlibat(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                      Catatan Hasil Pembinaan / Rencana Tindakan
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tuliskan ringkasan pembinaan, komitmen siswa, atau catatan penting Guru BK..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("riwayat")}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#173456] dark:text-slate-300 dark:hover:bg-[#173456]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAction}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#071a3a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0c2e63] disabled:opacity-50 dark:bg-[#f4c542] dark:text-[#071a3a]"
                    >
                      {isSubmittingAction ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Simpan Tindakan</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
                )
              )}

              {/* KONTEN TAB 3: FORM PERUBAHAN STATUS KASUS */}
              {activeTab === "status" && (
                getAvailableStatusOptions().length === 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                      <p className="font-bold flex items-center gap-1.5 text-sm">
                        <AlertCircle size={16} className="text-slate-500" />
                        Status Kasus Tidak Dapat Diubah
                      </p>
                      <p className="mt-2 leading-relaxed">
                        Kasus ini saat ini berstatus <strong className="font-semibold">{currentStatus}</strong>. Sesuai ketentuan operasional dan SOP, kasus dengan status ini tidak dapat dialihkan ke status lain secara langsung.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab("riwayat")}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-[#173456] dark:text-slate-300"
                      >
                        Kembali ke Riwayat
                      </button>
                    </div>
                  </div>
                ) : (
                <form onSubmit={handleUpdateStatus} className="space-y-4">
                  {statusFormError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{statusFormError}</span>
                    </div>
                  )}

                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldAlert size={14} />
                      Ketentuan Alur Transisi Status Kasus:
                    </p>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11.5px]">
                      <li>
                        Status <strong className="font-semibold">SELESAI</strong> menutup tindak lanjut pembinaan kasus, namun <strong>TIDAK mengurangi atau menghapus akumulasi poin DSS siswa</strong>.
                      </li>
                      <li>
                        Perubahan status secara otomatis dicatat ke riwayat audit log permanen dalam transaksi database atomik.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                      Pilih Status Kasus Baru
                    </label>
                    <select
                      value={targetStatus}
                      onChange={(e) =>
                        setTargetStatus(e.target.value as StatusTindakLanjutKasus)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                    >
                      {getAvailableStatusOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#071a3a] dark:text-white mb-1">
                      Alasan / Catatan Perubahan Status (Wajib dicatat untuk Audit Log)
                    </label>
                    <textarea
                      required
                      minLength={5}
                      maxLength={1000}
                      rows={3}
                      placeholder="Jelaskan alasan atau kesimpulan mengapa status kasus ini diubah (minimal 5 karakter)..."
                      value={catatanPerubahan}
                      onChange={(e) => setCatatanPerubahan(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-[#071a3a] focus:border-[#071a3a] focus:outline-none dark:border-[#173456] dark:bg-[#071526] dark:text-white"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("riwayat")}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#173456] dark:text-slate-300 dark:hover:bg-[#173456]"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingStatus}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#071a3a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0c2e63] disabled:opacity-50 dark:bg-[#f4c542] dark:text-[#071a3a]"
                    >
                      {isSubmittingStatus ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRightCircle size={13} />
                          <span>Terapkan Status Baru</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
                )
              )}
            </>
          ) : null}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#f8fafc] px-5 py-3 dark:border-[#173456] dark:bg-[#071526]">
          <span className="text-[11px] text-[#5b6b85] dark:text-[#829dbf]">
            Kerahasiaan data pembinaan dilindungi oleh Peraturan Sekolah SI-BK-26.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 dark:bg-[#173456] dark:text-white dark:hover:bg-[#20456f]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
