import { prisma } from "@/lib/prisma";

export const pelanggaranRepository = {
  // Transaksi atomik: input log pelanggaran + tambah akumulasi poin siswa
  async createWithAtomicIncrement(data: {
    siswaId: number;
    jenisPelanggaran: string;
    poin: number;
    counselorId?: number | null;
    keterangan?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const pelanggaran = await tx.pelanggaran.create({
        data: {
          siswaId: data.siswaId,
          counselorId: data.counselorId ?? null,
          jenisPelanggaran: data.jenisPelanggaran,
          poin: data.poin,
          keterangan: data.keterangan ?? null,
        },
        include: {
          counselor: {
            select: { id: true, nip: true, nama_counselor: true },
          },
          siswa: {
            select: { id: true, nisn: true, nama_siswa: true, rombel: true, totalPoin: true },
          },
        },
      });

      const updatedSiswa = await tx.siswa.update({
        where: { id: data.siswaId },
        data: {
          totalPoin: { increment: data.poin },
          updatedAt: new Date(),
        },
        select: {
          id: true,
          nisn: true,
          nipd: true,
          nama_siswa: true,
          rombel: true,
          totalPoin: true,
        },
      });

      return { pelanggaran, updatedSiswa };
    });
  },

  findById(id: number) {
    return prisma.pelanggaran.findUnique({
      where: { id },
      include: {
        siswa: true,
        counselor: true,
      },
    });
  },

  findBySiswaId(siswaId: number) {
    return prisma.pelanggaran.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      include: {
        counselor: true,
      },
    });
  },

  // Rekap data kedisiplinan siswa (mendukung pagination dan pencarian)
  async findAllSiswaWithDisiplin(
    page: number = 1,
    limit: number = 10,
    filters?: { rombel?: string; search?: string }
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const where = {
      ...(filters?.rombel ? { rombel: filters.rombel } : {}),
      ...(filters?.search
        ? {
            OR: [
              { nama_siswa: { contains: filters.search } },
              { nisn: { contains: filters.search } },
              { nipd: { contains: filters.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.siswa.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          nisn: true,
          nipd: true,
          nama_siswa: true,
          jenis_kelamin: true,
          rombel: true,
          totalPoin: true,
          pelanggaran: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              jenisPelanggaran: true,
              poin: true,
              keterangan: true,
              createdAt: true,
              counselor: {
                select: { id: true, nama_counselor: true },
              },
            },
          },
        },
        orderBy: [{ totalPoin: "desc" }, { nama_siswa: "asc" }],
      }),
      prisma.siswa.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Rekap hasil asesmen per rombel
  getRekapAssessmentByRombel(rombel?: string) {
    const where = rombel ? { rombel } : {};

    return prisma.siswa.findMany({
      where,
      select: {
        id: true,
        nisn: true,
        nama_siswa: true,
        rombel: true,
        jenis_kelamin: true,
        gayaBelajar: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            skorV: true,
            skorA: true,
            skorK: true,
            dominan: true,
            createdAt: true,
          },
        },
        minatBakat: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            kodeTop3: true,
            rekomendasi: true,
            skorR: true,
            skorI: true,
            skorA: true,
            skorS: true,
            skorE: true,
            skorC: true,
            createdAt: true,
          },
        },
      },
      orderBy: [{ rombel: "asc" }, { nama_siswa: "asc" }],
    });
  },

  // Riwayat pelanggaran berpaginasi
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
      prisma.pelanggaran.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: sortOrder },
        include: {
          siswa: true,
          counselor: true,
        },
      }),
      prisma.pelanggaran.count({ where }),
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