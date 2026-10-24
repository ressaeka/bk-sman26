import { prisma } from "@/lib/prisma";

export const dashboardRepository = {
  /**
   * Menghitung total siswa aktif di database
   */
  async countTotalSiswa(): Promise<number> {
    return prisma.siswa.count();
  },

  /**
   * Agregasi status konseling seluruh database (tidak terpengaruh pagination)
   */
  async getCounselingStatusCounts(): Promise<{
    pending: number;
    approved: number;
    completed: number;
    rejected: number;
    total: number;
  }> {
    const grouped = await prisma.konseling.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    let pending = 0;
    let approved = 0;
    let completed = 0;
    let rejected = 0;

    for (const g of grouped) {
      const count = g._count.id;
      if (g.status === "PENDING") pending += count;
      else if (g.status === "DISETUJUI") approved += count;
      else if (g.status === "SELESAI") completed += count;
      else if (g.status === "DITOLAK") rejected += count;
    }

    return {
      pending,
      approved,
      completed,
      rejected,
      total: pending + approved + completed + rejected,
    };
  },

  /**
   * Mengambil semua catatan pelanggaran valid sejak batas waktu tertentu
   * untuk agregasi deret waktu tren 6 bulan kalender (mengecualikan kasus DIBATALKAN)
   */
  async getViolationsSince(startDate: Date): Promise<
    Array<{
      id: number;
      poin: number;
      jenisPelanggaran: string;
      createdAt: Date;
    }>
  > {
    return prisma.pelanggaran.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        statusTindakLanjut: {
          not: "DIBATALKAN",
        },
      },
      select: {
        id: true,
        poin: true,
        jenisPelanggaran: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  /**
   * Menghitung total catatan pelanggaran seluruh database
   */
  async countTotalViolations(): Promise<number> {
    return prisma.pelanggaran.count();
  },

  /**
   * Menghitung total siswa yang berada dalam ambang batas sanksi (totalPoin >= 25)
   */
  async countCriticalStudents(minPoin: number = 25): Promise<number> {
    return prisma.siswa.count({
      where: {
        totalPoin: {
          gte: minPoin,
        },
      },
    });
  },

  /**
   * Menghitung jadwal asesmen yang aktif saat ini (berdasarkan tanggal server)
   */
  async countActiveSchedules(serverNow: Date = new Date()): Promise<number> {
    return prisma.jadwalAsesmen.count({
      where: {
        isActive: true,
        tanggalMulai: {
          lte: serverNow,
        },
        tanggalSelesai: {
          gte: serverNow,
        },
      },
    });
  },

  /**
   * Menghitung jumlah berkas Angket Masalah yang masih berstatus PENDING review
   */
  async countPendingAngketReview(): Promise<number> {
    return prisma.angketMasalah.count({
      where: {
        statusReview: "PENDING",
      },
    });
  },

  /**
   * Mengambil rekapitulasi jumlah siswa yang sudah menyelesaikan masing-masing tes asesmen
   */
  async getAssessmentCompletionStats(): Promise<{
    totalSiswa: number;
    totalMengisiVak: number;
    totalMengisiRiasec: number;
    totalMengisiAngket: number;
  }> {
    const [totalSiswa, totalMengisiVak, totalMengisiRiasec, totalMengisiAngket] =
      await Promise.all([
        prisma.siswa.count(),
        prisma.gayaBelajar.count(),
        prisma.minatBakat.count(),
        prisma.angketMasalah.count(),
      ]);

    return {
      totalSiswa,
      totalMengisiVak,
      totalMengisiRiasec,
      totalMengisiAngket,
    };
  },

  /**
   * Mengambil distribusi kategori pelanggaran dari seluruh log valid di database (mengecualikan kasus DIBATALKAN)
   */
  async getAllViolationsForCategoryDistribution(): Promise<
    Array<{ jenisPelanggaran: string; poin: number }>
  > {
    return prisma.pelanggaran.findMany({
      where: {
        statusTindakLanjut: {
          not: "DIBATALKAN",
        },
      },
      select: {
        jenisPelanggaran: true,
        poin: true,
      },
    });
  },

  /**
   * Mengambil rekap status tindak lanjut pelanggaran untuk dashboard
   */
  async getViolationFollowUpBreakdown(): Promise<{
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
