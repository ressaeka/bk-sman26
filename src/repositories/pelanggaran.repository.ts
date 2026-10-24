import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  StatusTindakLanjutKasus,
  StatusPelaksanaanTindakan,
  BentukTindakLanjut,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/constants/pelanggaran.constant";
import { AppError } from "@/lib/utils/response";

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
          statusTindakLanjut: "BELUM_DITANGANI",
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

  // Mengambil detail lengkap pelanggaran beserta histori tindak lanjut kronologis
  async findByIdWithTindakLanjut(id: number) {
    return prisma.pelanggaran.findUnique({
      where: { id },
      include: {
        siswa: {
          select: {
            id: true,
            nisn: true,
            nipd: true,
            nama_siswa: true,
            jenis_kelamin: true,
            rombel: true,
            totalPoin: true,
          },
        },
        counselor: {
          select: {
            id: true,
            nip: true,
            nama_counselor: true,
          },
        },
        tindakLanjut: {
          orderBy: [{ tanggalTindakan: "desc" }, { createdAt: "desc" }],
          include: {
            counselor: {
              select: {
                id: true,
                nip: true,
                nama_counselor: true,
              },
            },
          },
        },
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
              statusTindakLanjut: true,
              createdAt: true,
              counselor: {
                select: { id: true, nama_counselor: true },
              },
              _count: {
                select: {
                  tindakLanjut: {
                    where: {
                      NOT: [
                        { catatan: { startsWith: "[AUDIT_STATUS]" } },
                        { catatan: { startsWith: "[PERUBAHAN STATUS" } },
                      ],
                    },
                  },
                },
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

  // Mengambil daftar pelanggaran dengan filter status tindak lanjut, rombel, dan pencarian
  async findAllPelanggaran(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: StatusTindakLanjutKasus;
      rombel?: string;
      search?: string;
    }
  ) {
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.PelanggaranWhereInput = {};

    if (filters?.status) {
      where.statusTindakLanjut = filters.status;
    }

    if (filters?.rombel) {
      where.siswa = { rombel: filters.rombel };
    }

    if (filters?.search) {
      where.OR = [
        { jenisPelanggaran: { contains: filters.search } },
        { siswa: { nama_siswa: { contains: filters.search } } },
        { siswa: { nisn: { contains: filters.search } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.pelanggaran.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          siswa: {
            select: {
              id: true,
              nisn: true,
              nipd: true,
              nama_siswa: true,
              rombel: true,
              totalPoin: true,
            },
          },
          counselor: {
            select: {
              id: true,
              nama_counselor: true,
            },
          },
          _count: {
            select: {
              tindakLanjut: {
                where: {
                  NOT: [
                    { catatan: { startsWith: "[AUDIT_STATUS]" } },
                    { catatan: { startsWith: "[PERUBAHAN STATUS" } },
                  ],
                },
              },
            },
          },
          tindakLanjut: {
            where: {
              NOT: [
                { catatan: { startsWith: "[AUDIT_STATUS]" } },
                { catatan: { startsWith: "[PERUBAHAN STATUS" } },
              ],
            },
            orderBy: [{ tanggalTindakan: "desc" }, { createdAt: "desc" }],
            take: 1,
            select: {
              id: true,
              bentukTindakan: true,
              statusPelaksanaan: true,
              tanggalTindakan: true,
              catatan: true,
            },
          },
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

  // Rekap hasil asesmen per rombel
  async getRekapAssessmentByRombel(rombel?: string, take: number = 100) {
    return prisma.siswa.findMany({
      where: rombel ? { rombel } : undefined,
      take, // Mencegah crash memori server jika rombel dikosongkan
      orderBy: { nama_siswa: "asc" },
      select: {
        id: true,
        nisn: true,
        nama_siswa: true,
        rombel: true,
        gayaBelajar: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { dominan: true, createdAt: true },
        },
        minatBakat: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { kodeTop3: true, rekomendasi: true, createdAt: true },
        },
        angketMasalah: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true, statusReview: true, daftarMasalah: true, createdAt: true },
        },
      },
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
          _count: {
            select: {
              tindakLanjut: {
                where: {
                  NOT: [
                    { catatan: { startsWith: "[AUDIT_STATUS]" } },
                    { catatan: { startsWith: "[PERUBAHAN STATUS" } },
                  ],
                },
              },
            },
          },
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

  // Mencatat tindakan pembinaan baru secara atomik dan memperbarui status kasus jika relevan
  async createTindakLanjut(data: {
    pelanggaranId: number;
    counselorId?: number | null;
    bentukTindakan: BentukTindakLanjut;
    statusPelaksanaan: StatusPelaksanaanTindakan;
    statusKasusBaru?: StatusTindakLanjutKasus;
    tanggalTindakan: Date;
    pihakTerlibat?: string | null;
    catatan: string;
    tenggatEvaluasi?: Date | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const pelanggaran = await tx.pelanggaran.findUnique({
        where: { id: data.pelanggaranId },
      });

      if (!pelanggaran) {
        return null;
      }

      // Validasi perlindungan kasus yang sudah ditutup/dibatalkan
      if (pelanggaran.statusTindakLanjut === "SELESAI") {
        throw new AppError(
          "Tidak dapat menambahkan tindakan pembinaan pada kasus yang sudah SELESAI. Silakan buka kembali kasus (ke status DALAM_PEMBINAAN) terlebih dahulu.",
          400
        );
      }

      if (pelanggaran.statusTindakLanjut === "DIBATALKAN") {
        throw new AppError(
          "Tidak dapat menambahkan tindakan pembinaan pada kasus yang telah DIBATALKAN.",
          400
        );
      }

      // Validasi transisi status baru jika diberikan secara eksplisit
      let nextStatus: StatusTindakLanjutKasus = pelanggaran.statusTindakLanjut;
      if (data.statusKasusBaru) {
        if (data.statusKasusBaru !== pelanggaran.statusTindakLanjut) {
          const allowed = ALLOWED_STATUS_TRANSITIONS[pelanggaran.statusTindakLanjut] || [];
          if (!allowed.includes(data.statusKasusBaru)) {
            throw new AppError(
              `Perubahan status kasus dari ${pelanggaran.statusTindakLanjut} ke ${data.statusKasusBaru} tidak diizinkan.`,
              400
            );
          }
          nextStatus = data.statusKasusBaru;
        }
      } else if (
        data.statusPelaksanaan === "TERLAKSANA" &&
        pelanggaran.statusTindakLanjut === "BELUM_DITANGANI"
      ) {
        nextStatus = "DALAM_PEMBINAAN";
      }

      const trimmedCatatan = (data.catatan || "").trim();
      if (
        trimmedCatatan.startsWith("[AUDIT_STATUS]") ||
        trimmedCatatan.startsWith("[PERUBAHAN STATUS")
      ) {
        throw new AppError(
          "Catatan tindakan pembinaan tidak boleh menggunakan prefix audit sistem ('[AUDIT_STATUS]' atau '[PERUBAHAN STATUS')",
          400
        );
      }

      const tindakLanjut = await tx.tindakLanjutPelanggaran.create({
        data: {
          pelanggaranId: data.pelanggaranId,
          counselorId: data.counselorId ?? null,
          bentukTindakan: data.bentukTindakan,
          statusPelaksanaan: data.statusPelaksanaan,
          tanggalTindakan: data.tanggalTindakan,
          pihakTerlibat: data.pihakTerlibat ?? null,
          catatan: data.catatan,
          tenggatEvaluasi: data.tenggatEvaluasi ?? null,
        },
        include: {
          counselor: {
            select: { id: true, nip: true, nama_counselor: true },
          },
        },
      });

      let updatedPelanggaran = pelanggaran;
      if (nextStatus !== pelanggaran.statusTindakLanjut) {
        updatedPelanggaran = await tx.pelanggaran.update({
          where: { id: data.pelanggaranId },
          data: {
            statusTindakLanjut: nextStatus,
            updatedAt: new Date(),
          },
        });
      }

      return { tindakLanjut, pelanggaran: updatedPelanggaran };
    });
  },

  // Mengubah status kasus pelanggaran dengan pencatatan audit log wajib dalam transaksi yang sama
  async updateStatusKasus(data: {
    pelanggaranId: number;
    status: StatusTindakLanjutKasus;
    counselorId?: number | null;
    catatanPerubahan: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const pelanggaran = await tx.pelanggaran.findUnique({
        where: { id: data.pelanggaranId },
      });

      if (!pelanggaran) {
        return null;
      }

      const fromStatus = pelanggaran.statusTindakLanjut;
      const toStatus = data.status;

      // 1. Tolak transisi ke status yang sama
      if (fromStatus === toStatus) {
        throw new AppError(
          `Status kasus sudah ${fromStatus}. Tidak ada perubahan status.`,
          400
        );
      }

      // 2. Tolak transisi ilegal berdasarkan ALLOWED_STATUS_TRANSITIONS
      const allowed = ALLOWED_STATUS_TRANSITIONS[fromStatus] || [];
      if (!allowed.includes(toStatus)) {
        throw new AppError(
          `Perubahan status dari ${fromStatus} ke ${toStatus} tidak diizinkan.`,
          400
        );
      }

      // 3. Validasi wajib alasan perubahan
      const trimmedReason = (data.catatanPerubahan || "").trim();
      if (trimmedReason.length < 5) {
        throw new AppError(
          "Alasan perubahan status wajib diisi minimal 5 karakter",
          400
        );
      }

      // 4. Update status pelanggaran secara kondisional (Optimistic Concurrency Control)
      // Menjamin secara atomik di engine database bahwa status saat ini belum berubah sejak dibaca
      const updateResult = await tx.pelanggaran.updateMany({
        where: {
          id: data.pelanggaranId,
          statusTindakLanjut: fromStatus,
        },
        data: {
          statusTindakLanjut: toStatus,
          updatedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new AppError(
          "Konflik pembaruan status: Status kasus telah diubah oleh transaksi lain secara bersamaan. Silakan muat ulang data.",
          409
        );
      }

      const updated = await tx.pelanggaran.findUnique({
        where: { id: data.pelanggaranId },
      });

      if (!updated) {
        return null;
      }

      // 5. Catat audit log dalam transaksi yang sama (wajib, rollback jika gagal)
      // Mencakup: from, to, alasan, counselorId, dan waktu perubahan
      const now = new Date();
      const auditLog = await tx.tindakLanjutPelanggaran.create({
        data: {
          pelanggaranId: data.pelanggaranId,
          counselorId: data.counselorId ?? null,
          bentukTindakan: "LAINNYA",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: now,
          pihakTerlibat: "Guru BK",
          catatan: `[AUDIT_STATUS] from: ${fromStatus} -> to: ${toStatus} | alasan: ${trimmedReason} | [PERUBAHAN STATUS -> ${toStatus}]`,
        },
        include: {
          counselor: {
            select: { id: true, nip: true, nama_counselor: true },
          },
        },
      });

      return { pelanggaran: updated, auditLog };
    });
  },

  // Agregasi statistik status tindak lanjut seluruh database untuk dashboard
  async getFollowUpStats(): Promise<{
    belumDitangani: number;
    dalamPembinaan: number;
    selesai: number;
    dibatalkan: number;
    total: number;
  }> {
    const grouped = await prisma.pelanggaran.groupBy({
      by: ["statusTindakLanjut"],
      _count: { id: true },
    });

    let belumDitangani = 0;
    let dalamPembinaan = 0;
    let selesai = 0;
    let dibatalkan = 0;

    for (const g of grouped) {
      const count = g._count.id;
      if (g.statusTindakLanjut === "BELUM_DITANGANI") belumDitangani += count;
      else if (g.statusTindakLanjut === "DALAM_PEMBINAAN") dalamPembinaan += count;
      else if (g.statusTindakLanjut === "SELESAI") selesai += count;
      else if (g.statusTindakLanjut === "DIBATALKAN") dibatalkan += count;
    }

    return {
      belumDitangani,
      dalamPembinaan,
      selesai,
      dibatalkan,
      total: belumDitangani + dalamPembinaan + selesai + dibatalkan,
    };
  },
};