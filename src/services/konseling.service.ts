import { konselingRepository } from "@/repositories/konseling.repository";
import {
  STATUS_KONSELING,
  StatusKonseling,
  STATUS_KONSELING_META,
} from "@/constants/konseling.constant";
import { CreateKonselingInput } from "@/schemas/konseling.schema";
import { AppError } from "@/lib/utils/response";
import { prisma } from "@/lib/prisma"; // Pastikan import prisma ada

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
  // Siswa bikin janji temu baru dengan transaksi atomik anti-race-condition
  async createSession(siswaId: number, data: CreateKonselingInput) {
    // Cek format tanggalnya dulu sebelum masuk transaksi
    const tanggalDate = new Date(data.tanggal);
    if (isNaN(tanggalDate.getTime())) {
      throw new AppError("Format tanggalnya salah nih, coba cek lagi", 400);
    }

    // Bungkus pengecekan dan pembuatan data dalam transaksi Prisma dengan pessimistic row lock
    const session = await prisma.$transaction(async (tx) => {
      // 1. Ambil exclusive lock pada baris siswa untuk memblokir concurrent double-submission
      await tx.$queryRaw`SELECT id FROM siswa WHERE id = ${siswaId} FOR UPDATE`;

      // 2. Cek apakah siswa masih punya sesi aktif (PENDING / DISETUJUI)
      const activeSession = await tx.konseling.findFirst({
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

      // 3. Simpan sesi baru ke database di dalam transaksi yang sama
      return tx.konseling.create({
        data: {
          siswaId,
          tanggal: tanggalDate,
          jam: data.jam.trim(),
          topik: data.topik.trim(),
          keluhan: data.keluhan ? data.keluhan.trim() : null,
          status: STATUS_KONSELING.PENDING,
        },
        include: {
          siswa: true,
          counselor: true,
        },
      });
    });

    return formatKonselingSession(session as KonselingEntity);
  },

  // Buat ngecek riwayat permohonan konseling punya siswa yang lagi login
  async getSiswaHistory(siswaId: number) {
    const sessions = await konselingRepository.findAllBySiswaId(siswaId);
    return sessions.map((s) => formatKonselingSession(s as KonselingEntity));
  },

  // Siswa mengambil detail satu sesi konseling miliknya sendiri (mencegah IDOR)
  async getSiswaSessionById(id: number, siswaId: number) {
    const session = await konselingRepository.findById(id);
    if (!session || session.siswaId !== siswaId) {
      throw new AppError("Data sesi konseling tidak ditemukan", 404);
    }
    return formatKonselingSession(session as KonselingEntity);
  },

  // Siswa membatalkan pengajuan konseling miliknya yang masih PENDING
  async cancelSessionBySiswa(id: number, siswaId: number) {
    const cancelled = await prisma.$transaction(async (tx) => {
      // 1. Ambil baris sesi konseling di dalam transaksi
      const session = await tx.konseling.findUnique({
        where: { id },
      });

      if (!session || session.siswaId !== siswaId) {
        throw new AppError("Data sesi konseling tidak ditemukan", 404);
      }

      // 2. Hanya pengajuan PENDING yang boleh dibatalkan oleh siswa
      if (session.status !== STATUS_KONSELING.PENDING) {
        const statusLabel =
          STATUS_KONSELING_META[session.status as StatusKonseling]?.label || session.status;
        throw new AppError(
          `Pengajuan tidak dapat dibatalkan karena sudah berstatus "${statusLabel}". Hanya pengajuan berstatus Menunggu Persetujuan yang dapat dibatalkan.`,
          400
        );
      }

      // 3. Update status menjadi DITOLAK dengan catatan sistem "Dibatalkan oleh siswa"
      return tx.konseling.update({
        where: { id },
        data: {
          status: STATUS_KONSELING.DITOLAK,
          catatanGuruBK: "Dibatalkan oleh siswa",
          updatedAt: new Date(),
        },
        include: {
          siswa: true,
          counselor: true,
        },
      });
    });

    return formatKonselingSession(cancelled as KonselingEntity);
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

  // Ambil detail satu sesi konseling lewat ID-nya (untuk Guru BK)
  async getSessionById(id: number) {
    const session = await konselingRepository.findById(id);
    if (!session) return null;
    return formatKonselingSession(session as KonselingEntity);
  },

  // Guru BK update status (terima/tolak/selesai) dengan pencegahan bentrok jadwal atomik
  async updateSessionStatus(
    id: number,
    counselorId: number,
    status: StatusKonseling,
    catatanGuruBK?: string | null
  ) {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Kunci baris counselor untuk memblokir concurrent approvals pada guru BK yang sama
      await tx.$queryRaw`SELECT id FROM counselor WHERE id = ${counselorId} FOR UPDATE`;

      // 2. Ambil sesi yang akan diupdate
      const existing = await tx.konseling.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new AppError("Sesi konseling nggak ketemu", 404);
      }

      // 3. Jika status diubah menjadi DISETUJUI, periksa bentrok jadwal
      if (status === STATUS_KONSELING.DISETUJUI) {
        // Cek apakah Guru BK ini sudah memiliki sesi lain yang disetujui pada tanggal dan jam yang sama
        const conflictingBkSession = await tx.konseling.findFirst({
          where: {
            id: { not: id },
            counselorId,
            tanggal: existing.tanggal,
            jam: existing.jam,
            status: STATUS_KONSELING.DISETUJUI,
          },
        });

        if (conflictingBkSession) {
          throw new AppError(
            "Guru BK sudah memiliki jadwal konseling lain yang telah disetujui pada tanggal dan jam tersebut. Silakan atur ulang waktu konseling.",
            409
          );
        }

        // Cek apakah Siswa ini sudah memiliki sesi lain yang disetujui pada tanggal dan jam yang sama
        const conflictingSiswaSession = await tx.konseling.findFirst({
          where: {
            id: { not: id },
            siswaId: existing.siswaId,
            tanggal: existing.tanggal,
            jam: existing.jam,
            status: STATUS_KONSELING.DISETUJUI,
          },
        });

        if (conflictingSiswaSession) {
          throw new AppError(
            "Siswa ini sudah memiliki jadwal konseling lain yang disetujui pada tanggal dan jam yang sama.",
            409
          );
        }
      }

      // 4. Update status dan catatan sesi
      return tx.konseling.update({
        where: { id },
        data: {
          status,
          counselorId,
          catatanGuruBK: catatanGuruBK !== undefined ? catatanGuruBK : existing.catatanGuruBK,
          updatedAt: new Date(),
        },
        include: {
          siswa: true,
          counselor: true,
        },
      });
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