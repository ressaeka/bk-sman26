import { konselingRepository } from "@/repositories/konseling.repository";
import {
  STATUS_KONSELING,
  StatusKonseling,
  STATUS_KONSELING_META,
} from "@/constants/konseling.constant";
import { CreateKonselingInput } from "@/schemas/konseling.schema";
import { AppError } from "@/lib/utils/response";
import { KonselingWhereInput } from "@/generated/prisma/models";

export function formatKonselingSession(session: KonselingWhereInput) {
  const meta = STATUS_KONSELING_META[session.status as StatusKonseling] ?? {
    label: session.status,
    badgeVariant: "pending" as const,
  };

  const tanggalFormatted =
    session.tanggal instanceof Date
      ? session.tanggal.toISOString().split("T")[0]
      : String(session.tanggal).split("T")[0];

  return {
    id: session.id,
    siswaId: session.siswaId,
    siswa: session.siswa
      ? {
          id: session.siswa.id,
          nisn: session.siswa.nisn,
          nama: session.siswa.nama_siswa,
          rombel: session.siswa.rombel,
        }
      : null,
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
  async createSession(siswaId: number, data: CreateKonselingInput) {
    const tanggalDate = new Date(data.tanggal);
    if (isNaN(tanggalDate.getTime())) {
      throw new AppError("Format tanggal tidak valid", 400);
    }

    const session = await konselingRepository.create({
      siswaId,
      tanggal: tanggalDate,
      jam: data.jam.trim(),
      topik: data.topik.trim(),
      keluhan: data.keluhan ? data.keluhan.trim() : null,
      status: STATUS_KONSELING.PENDING,
    });

    return formatKonselingSession(session);
  },

  async getSiswaHistory(siswaId: number) {
    const sessions = await konselingRepository.findAllBySiswaId(siswaId);
    return sessions.map(formatKonselingSession);
  },

  // Sambungkan langsung ke findPaginated repository
  async getAllSessionsForBk(
    page: number = 1,
    limit: number = 10,
    sortOrder: "asc" | "desc" = "desc",
    filter?: { status?: string; counselorId?: number }
  ) {
    const result = await konselingRepository.findPaginated(page, limit, sortOrder, filter);

    return {
      items: result.items.map(formatKonselingSession),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },

  async getSessionById(id: number) {
    const session = await konselingRepository.findById(id);
    if (!session) return null;
    return formatKonselingSession(session);
  },

  async updateSessionStatus(
    id: number,
    counselorId: number,
    status: StatusKonseling,
    catatanGuruBK?: string | null
  ) {
    const existing = await konselingRepository.findById(id);
    if (!existing) {
      throw new AppError("Sesi konseling tidak ditemukan", 404);
    }

    const updated = await konselingRepository.update(id, {
      status,
      counselorId,
      catatanGuruBK: catatanGuruBK !== undefined ? catatanGuruBK : existing.catatanGuruBK,
    });

    return formatKonselingSession(updated);
  },
};