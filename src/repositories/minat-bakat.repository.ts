import { prisma } from "@/lib/prisma";

export const minatBakatRepository = {
  create(data: {
    siswaId: number;
    kodeTop3: string;
    rekomendasi: string;
    skorR: number;
    skorI: number;
    skorA: number;
    skorS: number;
    skorE: number;
    skorC: number;
  }) {
    return prisma.minatBakat.create({
      data,
      include: {
        siswa: true,
      },
    });
  },

  findById(id: number) {
    return prisma.minatBakat.findUnique({
      where: { id },
      include: {
        siswa: true,
      },
    });
  },

  findLatestBySiswaId(siswaId: number) {
    return prisma.minatBakat.findFirst({
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
    return prisma.minatBakat.findMany({
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
    return prisma.minatBakat.findMany({
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
    filters?: {
      siswaId?: number;
      nisn?: string;
      rombel?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const where = {
      ...(filters?.siswaId ? { siswaId: filters.siswaId } : {}),
      ...(filters?.nisn ? { siswa: { nisn: filters.nisn } } : {}),
      ...(filters?.rombel ? { siswa: { rombel: filters.rombel } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.minatBakat.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          siswa: true,
        },
      }),
      prisma.minatBakat.count({ where }),
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