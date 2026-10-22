import { prisma } from "@/lib/prisma";

export const angketMasalahRepository = {
  create(data: {
    siswaId: number;
    daftarMasalah: string;
    statusReview?: string;
  }) {
    return prisma.angketMasalah.create({
      data: {
        siswaId: data.siswaId,
        daftarMasalah: data.daftarMasalah,
        statusReview: data.statusReview ?? "PENDING",
      },
      include: {
        siswa: true,
      },
    });
  },

  createWithCheck(
    siswaId: number,
    data: {
      daftarMasalah: string;
      statusReview?: string;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Ambil exclusive lock pada baris siswa untuk memblokir request konkuren dari siswa yang sama
      await tx.$queryRaw`SELECT id FROM siswa WHERE id = ${siswaId} FOR UPDATE`;

      // 2. Sekarang setelah lock dipegang secara eksklusif, periksa riwayat pengisian
      const existing = await tx.angketMasalah.findFirst({
        where: { siswaId },
      });

      if (existing) {
        return null;
      }

      // 3. Simpan jawaban angket masalah
      return tx.angketMasalah.create({
        data: {
          siswaId,
          daftarMasalah: data.daftarMasalah,
          statusReview: data.statusReview ?? "PENDING",
        },
        include: {
          siswa: true,
        },
      });
    });
  },

  findById(id: number) {
    return prisma.angketMasalah.findUnique({
      where: { id },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findLatestBySiswaId(siswaId: number) {
    return prisma.angketMasalah.findFirst({
      where: { siswaId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findAllBySiswaId(siswaId: number) {
    return prisma.angketMasalah.findMany({
      where: { siswaId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  updateReview(
    id: number,
    data: {
      statusReview: string;
      catatanGuruBK?: string | null;
      counselorId: number;
      reviewedAt: Date;
    }
  ) {
    return prisma.angketMasalah.update({
      where: { id },
      data: {
        statusReview: data.statusReview,
        catatanGuruBK: data.catatanGuruBK ?? null,
        counselorId: data.counselorId,
        reviewedAt: data.reviewedAt,
      },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  async findPaginated(
    skip: number,
    take: number,
    sortOrder: "asc" | "desc" = "desc",
    status?: string,
    siswaId?: number
  ) {
    const where = {
      ...(status ? { statusReview: status } : {}),
      ...(siswaId ? { siswaId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.angketMasalah.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          siswa: true,
          counselor: true,
        },
      }),
      prisma.angketMasalah.count({ where }),
    ]);

    return { items, total };
  },
};