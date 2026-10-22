import { prisma } from "@/lib/prisma";
import { TipeAsesmen } from "@/constants/jadwal-asesmen.constant";

export interface CreateJadwalInput {
  counselorId?: number | null;
  tipe: TipeAsesmen;
  judul: string;
  deskripsi?: string | null;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  targetTingkat?: string | null;
  targetRombel?: string | null;
  isActive?: boolean;
}

export interface UpdateJadwalInput {
  judul?: string;
  deskripsi?: string | null;
  tanggalMulai?: Date;
  tanggalSelesai?: Date;
  targetTingkat?: string | null;
  targetRombel?: string | null;
  isActive?: boolean;
}

export const jadwalAsesmenRepository = {
  findById(id: number) {
    return prisma.jadwalAsesmen.findUnique({
      where: { id },
      include: {
        counselor: {
          select: {
            id: true,
            nama_counselor: true,
            nip: true,
          },
        },
      },
    });
  },

  findAll(filters?: {
    tipe?: TipeAsesmen;
    targetTingkat?: string;
    targetRombel?: string;
    isActive?: boolean;
  }) {
    return prisma.jadwalAsesmen.findMany({
      where: {
        ...(filters?.tipe ? { tipe: filters.tipe } : {}),
        ...(filters?.targetTingkat ? { targetTingkat: filters.targetTingkat } : {}),
        ...(filters?.targetRombel ? { targetRombel: filters.targetRombel } : {}),
        ...(typeof filters?.isActive === "boolean" ? { isActive: filters.isActive } : {}),
      },
      orderBy: { tanggalMulai: "desc" },
      include: {
        counselor: {
          select: {
            id: true,
            nama_counselor: true,
            nip: true,
          },
        },
      },
    });
  },

  /**
   * Mengambil semua jadwal aktif untuk tipe asesmen tertentu
   * untuk kemudian difilter berdasarkan rombel/tingkat siswa di layer service.
   */
  findActiveByTipe(tipe: TipeAsesmen) {
    return prisma.jadwalAsesmen.findMany({
      where: {
        tipe,
        isActive: true,
      },
      orderBy: {
        tanggalMulai: "asc",
      },
    });
  },

  create(data: CreateJadwalInput) {
    return prisma.jadwalAsesmen.create({
      data: {
        counselorId: data.counselorId,
        tipe: data.tipe,
        judul: data.judul,
        deskripsi: data.deskripsi,
        tanggalMulai: data.tanggalMulai,
        tanggalSelesai: data.tanggalSelesai,
        targetTingkat: data.targetTingkat,
        targetRombel: data.targetRombel,
        isActive: data.isActive ?? true,
      },
    });
  },

  update(id: number, data: UpdateJadwalInput) {
    return prisma.jadwalAsesmen.update({
      where: { id },
      data,
    });
  },

  delete(id: number) {
    return prisma.jadwalAsesmen.delete({
      where: { id },
    });
  },
};
