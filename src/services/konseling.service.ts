import { prisma } from "@/lib/prisma";
import { konselingRepository } from "@/repositories/konseling.repository";
import {
  STATUS_KONSELING,
  StatusKonseling,
  STATUS_KONSELING_META,
} from "@/constants/konseling.constant";
import { CreateKonselingInput } from "@/schemas/konseling.schema";
import { AppError } from "@/lib/utils/response";

// Buat ngerapihin data sesi konseling dari DB biar enak dibaca pas dilempar ke frontend
export function formatKonselingSession(session: KonselingEntity) {
  // Ambil label status sama warna badge-nya
  const meta = STATUS_KONSELING_META[session.status as StatusKonseling] ?? {
    label: session.status,
    badgeVariant: "pending" as const,
  };

  // Ubah tanggal jadi format string simpel (YYYY-MM-DD)
  const tanggalFormatted =
    session.tanggal instanceof Date
      ? session.tanggal.toISOString().split("T")[0]
      : String(session.tanggal).split("T")[0];

  return {
    id: session.id,
    siswaId: session.siswaId,
    // Info singkat siswa yang ngajuin jadwal
    siswa: session.siswa
      ? {
          id: session.siswa.id,
          nisn: session.siswa.nisn,
          nama: session.siswa.nama_siswa,
          rombel: session.siswa.rombel,
        }
      : null,
    // Guru BK yang megang sesi konselingnya
    counselor: session.counselor
      ? {
          id: session.counselor.id,
          nip: session.counselor.nip,
          nama: session.counselor.nama_counselor,
        }
      : null,
    tanggal: tanggalFormatted,
    jam: session.jam,
    topik: session.topik,
    keluhan: session.keluhan,
    status: session.status,
    statusLabel: meta.label,
    badgeVariant: meta.badgeVariant,
    catatanGuruBK: session.catatanGuruBK,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export const konselingService = {
  // Siswa bikin janji temu baru, dicek dulu biar nggak spam kalo masih ada jadwal aktif
  async createSession(siswaId: number, data: CreateKonselingInput) {
    // 1. Cek dulu apakah siswa masih punya sesi yang statusnya PENDING atau DISETUJUI
    const activeSession = await prisma.konseling.findFirst({
      where: {
        siswaId,
        status: {
          in: [STATUS_KONSELING.PENDING, STATUS_KONSELING.DISETUJUI],
        },
      },
    });

    if (activeSession) {
      const statusText =
        activeSession.status === STATUS_KONSELING.PENDING
          ? "masih nunggu persetujuan Guru BK"
          : "udah disetujui dan belum selesai";

      throw new AppError(
        `Kamu masih punya jadwal konseling yang ${statusText}. Selesaiin dulu sesi itu baru bisa ngajuin jadwal baru ya.`,
        400
      );
    }

    // 2. Cek format tanggalnya
    const tanggalDate = new Date(data.tanggal);
    if (isNaN(tanggalDate.getTime())) {
      throw new AppError("Format tanggalnya salah nih, coba cek lagi", 400);
    }

    // 3. Simpan sesi baru ke database
    const session = await konselingRepository.create({
      siswaId,
      tanggal: tanggalDate,
      jam: data.jam.trim(),
      topik: data.topik.trim(),
      keluhan: data.keluhan ? data.keluhan.trim() : null,
      status: STATUS_KONSELING.PENDING,
    });

    return formatKonselingSession(session as KonselingEntity);
  },

  // Buat ngecek riwayat permohonan konseling punya siswa yang lagi login
  async getSiswaHistory(siswaId: number) {
    const sessions = await konselingRepository.findAllBySiswaId(siswaId);
    return sessions.map((s) => formatKonselingSession(s as KonselingEntity));
  },

  // Guru BK narik semua list jadwal konseling (ada paginasi & filter status)
  async getAllSessionsForBk(
    page: number = 1,
    limit: number = 10,
    sortOrder: "asc" | "desc" = "desc",
    filter?: { status?: string; counselorId?: number }
  ) {
    const result = await konselingRepository.findPaginated(page, limit, sortOrder, filter);

    return {
      items: result.items.map((s) => formatKonselingSession(s as KonselingEntity)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  // Ambil detail satu sesi konseling lewat ID-nya
  async getSessionById(id: number) {
    const session = await konselingRepository.findById(id);
    if (!session) return null;
    return formatKonselingSession(session as KonselingEntity);
  },

  // Guru BK update status (terima/tolak/selesai) sekalian ninggalin catatan arahan
  async updateSessionStatus(
    id: number,
    counselorId: number,
    status: StatusKonseling,
    catatanGuruBK?: string | null
  ) {
    // Pastiin dulu jadwal konselingnya beneran ada di database
    const existing = await konselingRepository.findById(id);
    if (!existing) {
      throw new AppError("Sesi konseling nggak ketemu", 404);
    }

    const updated = await konselingRepository.update(id, {
      status,
      counselorId,
      catatanGuruBK: catatanGuruBK !== undefined ? catatanGuruBK : existing.catatanGuruBK,
    });

    return formatKonselingSession(updated as KonselingEntity);
  },
};

// Cetak biru struktur data sesi konseling plus relasinya
export interface KonselingEntity {
  id: number;
  siswaId: number;
  counselorId: number | null;
  tanggal: Date | string;
  jam: string;
  topik: string;
  keluhan: string | null;
  status: string;
  catatanGuruBK: string | null;
  createdAt: Date;
  updatedAt: Date;
  siswa?: {
    id: number;
    nisn: string;
    nama_siswa: string | null;
    rombel: string | null;
  } | null;
  counselor?: {
    id: number;
    nip: string | null;
    nama_counselor: string;
  } | null;
}