import { prisma } from "@/lib/prisma";

export const gayaBelajarRepository = {
  create(data: {
    siswaId: number;
    skorV: number;
    skorA: number;
    skorK: number;
    dominan: string;
  }) {
    return prisma.gayaBelajar.create({
      data,
      include: {
        siswa: true,
      },
    });
  },

  findById(id: number) {
    return prisma.gayaBelajar.findUnique({
      where: { id },
      include: {
        siswa: true,
      },
    });
  },

  findLatestBySiswaId(siswaId: number) {
    return prisma.gayaBelajar.findFirst({
      where: { siswaId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
      },
    });
  },

  findAllBySiswaId(siswaId: number) {
    return prisma.gayaBelajar.findMany({
      where: { siswaId },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
      },
    });
  },

  findByRombel(rombel: string) {
    return prisma.gayaBelajar.findMany({
      where: {
        siswa: { rombel },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        siswa: true,
      },
    });
  },

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    sortOrder: "asc" | "desc" = "desc",
    siswaId?: number    
  ) {
    const skip = (page - 1) * limit;
    const take = limit;
    const where = siswaId ? { siswaId } : {};

    const [items, total] = await Promise.all([
      prisma.gayaBelajar.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: { siswa: true },
      }),
      prisma.gayaBelajar.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};