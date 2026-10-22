import { prisma } from "@/lib/prisma";

export interface StudentActivityItem {
  id: string;
  type: "ANGKET_MASALAH" | "KONSELING" | "MINAT_BAKAT" | "GAYA_BELAJAR";
  title: string;
  description: string;
  timestamp: string; // Format ISO string
  status?: string;
  badgeVariant?: "pending" | "info" | "danger" | "success" | "neutral";
  linkHref?: string;
  iconName: "FileText" | "MessageSquare" | "Compass" | "Sparkles" | "Calendar";
}

export const activityService = {
  /**
   * Mengumpulkan aktivitas terbaru siswa dari riwayat kejadian riil di database:
   * 1. Pengisian & review instrumen Angket Masalah
   * 2. Pengajuan & pembaruan status sesi Konseling
   * 3. Penyelesaian asesmen Gaya Belajar & Minat Bakat (jika ada)
   *
   * Diurutkan secara descending berdasarkan timestamp riil.
   */
  async getStudentRecentActivities(
    siswaId: number,
    limit: number = 5
  ): Promise<StudentActivityItem[]> {
    const activities: StudentActivityItem[] = [];

    // 1. Ambil data Angket Masalah
    const angketList = await prisma.angketMasalah.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    for (const angket of angketList) {
      // Aktivitas pengisian angket
      activities.push({
        id: `angket-submit-${angket.id}`,
        type: "ANGKET_MASALAH",
        title: "Pengisian Angket Masalah",
        description: "Instrumen butir masalah berhasil diserahkan ke Guru BK",
        timestamp: angket.createdAt.toISOString(),
        status: angket.statusReview === "PENDING" ? "Menunggu Review" : "Selesai Ditinjau",
        badgeVariant: angket.statusReview === "PENDING" ? "pending" : "success",
        linkHref: "/siswa/asesmen/angket-masalah",
        iconName: "FileText",
      });

      // Aktivitas jika sudah ditinjau guru BK
      if (angket.reviewedAt && angket.statusReview !== "PENDING") {
        activities.push({
          id: `angket-reviewed-${angket.id}`,
          type: "ANGKET_MASALAH",
          title: "Angket Masalah Telah Ditinjau",
          description: "Guru BK telah memeriksa jawaban angket masalahmu",
          timestamp: angket.reviewedAt.toISOString(),
          status: "Ditinjau",
          badgeVariant: "success",
          linkHref: "/siswa/asesmen/angket-masalah",
          iconName: "FileText",
        });
      }
    }

    // 2. Ambil data Konseling
    const konselingList = await prisma.konseling.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    for (const sesi of konselingList) {
      // Aktivitas pengajuan awal konseling
      activities.push({
        id: `konseling-submit-${sesi.id}`,
        type: "KONSELING",
        title: `Pengajuan Konseling: ${sesi.topik}`,
        description: `Permohonan jadwal konseling pukul ${sesi.jam.replace(/\s*wib\s*/gi, "").trim()} WIB`,
        timestamp: sesi.createdAt.toISOString(),
        status: "Diajukan",
        badgeVariant: "pending",
        linkHref: `/siswa/konseling/${sesi.id}`,
        iconName: "Calendar",
      });

      // Aktivitas perubahan status (jika status sudah bukan PENDING dan ada pembaruan)
      if (sesi.status !== "PENDING") {
        const isDiffTime =
          Math.abs(sesi.updatedAt.getTime() - sesi.createdAt.getTime()) > 1000;

        // Tampilkan aktivitas pembaruan status
        if (isDiffTime || sesi.status !== "PENDING") {
          let statusTitle = `Konseling: ${sesi.topik}`;
          let statusDesc = "Status konseling telah diperbarui";
          let badgeVariant: "success" | "danger" | "info" = "info";
          let statusLabel = sesi.status;

          if (sesi.status === "DISETUJUI") {
            statusTitle = `Konseling Disetujui: ${sesi.topik}`;
            statusDesc = "Guru BK telah menyetujui permohonan konselingmu";
            badgeVariant = "info";
            statusLabel = "Disetujui";
          } else if (sesi.status === "DITOLAK") {
            const isCancelled =
              sesi.catatanGuruBK?.trim().toLowerCase() === "dibatalkan oleh siswa";
            statusTitle = isCancelled
              ? `Konseling Dibatalkan: ${sesi.topik}`
              : `Pengajuan Konseling Ditolak: ${sesi.topik}`;
            statusDesc = isCancelled
              ? "Pengajuan konseling dibatalkan oleh kamu"
              : "Pengajuan jadwal konseling ditolak oleh Guru BK";
            badgeVariant = "danger";
            statusLabel = isCancelled ? "Dibatalkan" : "Ditolak";
          } else if (sesi.status === "SELESAI") {
            statusTitle = `Konseling Selesai: ${sesi.topik}`;
            statusDesc = "Sesi konseling telah selesai dilaksanakan";
            badgeVariant = "success";
            statusLabel = "Selesai";
          }

          activities.push({
            id: `konseling-status-${sesi.id}`,
            type: "KONSELING",
            title: statusTitle,
            description: statusDesc,
            timestamp: sesi.updatedAt.toISOString(),
            status: statusLabel,
            badgeVariant,
            linkHref: `/siswa/konseling/${sesi.id}`,
            iconName: "MessageSquare",
          });
        }
      }
    }

    // 3. Ambil data Gaya Belajar
    const gayaBelajarList = await prisma.gayaBelajar.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    for (const gb of gayaBelajarList) {
      activities.push({
        id: `gaya-belajar-${gb.id}`,
        type: "GAYA_BELAJAR",
        title: "Tes Gaya Belajar Selesai",
        description: `Tipe dominan belajarmu: ${gb.dominan}`,
        timestamp: gb.createdAt.toISOString(),
        status: "Selesai",
        badgeVariant: "success",
        linkHref: "/siswa/hasil-asesmen",
        iconName: "Sparkles",
      });
    }

    // 4. Ambil data Minat & Bakat
    const minatBakatList = await prisma.minatBakat.findMany({
      where: { siswaId },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    for (const mb of minatBakatList) {
      activities.push({
        id: `minat-bakat-${mb.id}`,
        type: "MINAT_BAKAT",
        title: "Tes Minat & Bakat Selesai",
        description: `Rekomendasi karir/jurusan: ${mb.rekomendasi}`,
        timestamp: mb.createdAt.toISOString(),
        status: "Selesai",
        badgeVariant: "success",
        linkHref: "/siswa/hasil-asesmen",
        iconName: "Compass",
      });
    }

    // 5. Urutkan seluruh aktivitas secara kronologis descending (terbaru di atas)
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Ambil sejumlah limit yang diminta (default: 5)
    return activities.slice(0, Math.max(1, limit));
  },
};
