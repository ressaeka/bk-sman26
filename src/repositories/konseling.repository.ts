import { prisma } from "@/lib/prisma";

export const konselingRepository = {
  create(data: {
    siswaId: number;
    tanggal: Date;
    jam: string;
    topik: string;
    keluhan?: string | null;
    status?: string;
    counselorId?: number | null;
  }) {
    return prisma.konseling.create({
      data: {
        siswaId: data.siswaId,
        tanggal: data.tanggal,
        jam: data.jam,
        topik: data.topik,
        keluhan: data.keluhan ?? null,
        status: data.status ?? "PENDING",
        counselorId: data.counselorId ?? null,
      },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findById(id: number) {
    return prisma.konseling.findUnique({
      where: { id },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findAllBySiswaId(siswaId: number) {
    return prisma.konseling.findMany({
      where: { siswaId },
      orderBy: [
        { tanggal: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findAll(filter?: { status?: string; counselorId?: number }) {
    return prisma.konseling.findMany({
      where: {
        status: filter?.status ? filter.status : undefined,
        counselorId: filter?.counselorId ? filter.counselorId : undefined,
      },
      orderBy: [
        { tanggal: "desc" },
        { id: "desc" },
      ],
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  update(
    id: number,
    data: {
      status: string;
      catatanGuruBK?: string | null;
      counselorId?: number;
    }
  ) {
    return prisma.konseling.update({
      where: { id },
      data: {
        status: data.status,
        catatanGuruBK: data.catatanGuruBK !== undefined ? data.catatanGuruBK : undefined,
        counselorId: data.counselorId !== undefined ? data.counselorId : undefined,
        updatedAt: new Date(),
      },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    sortOrder: "asc" | "desc" = "desc",
    filters?: {
      status?: string;
      counselorId?: number;
      siswaId?: number;
      nisn?: string;
      nip?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const where = {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.counselorId ? { counselorId: filters.counselorId } : {}),
      ...(filters?.siswaId ? { siswaId: filters.siswaId } : {}),
      ...(filters?.nisn ? { siswa: { nisn: filters.nisn } } : {}),
      ...(filters?.nip ? { counselor: { nip: filters.nip } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.konseling.findMany({
        where,
        skip,
        take,
        orderBy: { tanggal: sortOrder },
        include: {
          siswa: true,
          counselor: true,
        },
      }),
      prisma.konseling.count({ where }),
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