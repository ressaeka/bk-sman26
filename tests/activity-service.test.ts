import { prisma } from "../src/lib/prisma";
import { activityService } from "../src/services/activity.service";
import { STATUS_KONSELING } from "../src/constants/konseling.constant";

interface TestReport {
  id: string;
  name: string;
  category: "ACTIVITY" | "SECURITY" | "INTEGRITY";
  status: "PASSED" | "FAILED";
  details: string;
}

const testReports: TestReport[] = [];

function recordResult(report: TestReport) {
  testReports.push(report);
  const icon = report.status === "PASSED" ? "✅ [PASSED]" : "❌ [FAILED]";
  console.log(`${icon} [${report.category}] ${report.name} -> ${report.details}`);
}

async function runActivityServiceTests() {
  console.log("===============================================================");
  console.log("🚀 MEMULAI PENGUJIAN FITUR RECENT ACTIVITY SISWA (BK-26)");
  console.log("===============================================================");

  const timestamp = Date.now();
  const nisnA = `999${String(timestamp).slice(-7)}1`;
  const nisnB = `999${String(timestamp).slice(-7)}2`;

  let siswaA: { id: number };
  let siswaB: { id: number };

  try {
    // Setup Siswa A dan Siswa B
    siswaA = await prisma.siswa.create({
      data: {
        nisn: nisnA,
        nama_siswa: `Siswa Activity A ${timestamp}`,
        rombel: "XII-IPA-1",
        totalPoin: 0,
      },
      select: { id: true },
    });

    siswaB = await prisma.siswa.create({
      data: {
        nisn: nisnB,
        nama_siswa: `Siswa Activity B ${timestamp}`,
        rombel: "XII-IPA-2",
        totalPoin: 0,
      },
      select: { id: true },
    });

    // ------------------------------------------------------------------------
    // TEST 1: Empty state saat belum ada aktivitas
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 1: Pengujian empty state saat belum ada aktivitas...");
    const emptyActivities = await activityService.getStudentRecentActivities(siswaA.id, 5);
    if (emptyActivities.length === 0) {
      recordResult({
        id: "ACT-01",
        name: "Empty State Aktivitas",
        category: "ACTIVITY",
        status: "PASSED",
        details: "Siswa yang belum memiliki aktivitas mengembalikan array kosong.",
      });
    } else {
      recordResult({
        id: "ACT-01",
        name: "Empty State Aktivitas",
        category: "ACTIVITY",
        status: "FAILED",
        details: `Diharapkan 0 aktivitas, ditemukan ${emptyActivities.length}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 2: Angket Masalah muncul sebagai aktivitas
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 2: Pengujian aktivitas pengisian Angket Masalah...");
    await prisma.angketMasalah.create({
      data: {
        siswaId: siswaA.id,
        daftarMasalah: JSON.stringify([1, 2, 3]),
        statusReview: "PENDING",
        ceritaTambahan: "Ini adalah cerita pribadi rahasia siswa",
      },
    });

    const activitiesAfterAngket = await activityService.getStudentRecentActivities(siswaA.id, 5);
    const angketAct = activitiesAfterAngket.find((a) => a.type === "ANGKET_MASALAH");

    if (
      angketAct &&
      angketAct.title.includes("Angket Masalah") &&
      angketAct.status === "Menunggu Review" &&
      // Pastikan data rahasia tidak bocor di deskripsi
      !angketAct.description.includes("cerita pribadi rahasia siswa") &&
      !angketAct.description.includes("[1, 2, 3]")
    ) {
      recordResult({
        id: "ACT-02",
        name: "Aktivitas Angket Masalah & Privasi",
        category: "ACTIVITY",
        status: "PASSED",
        details: "Angket Masalah muncul sebagai aktivitas dengan tanggal riil tanpa membocorkan data sensitif.",
      });
    } else {
      recordResult({
        id: "ACT-02",
        name: "Aktivitas Angket Masalah & Privasi",
        category: "ACTIVITY",
        status: "FAILED",
        details: `Hasil aktivitas angket: ${JSON.stringify(angketAct)}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 3: Pengajuan Konseling muncul sebagai aktivitas
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 3: Pengujian aktivitas pengajuan Konseling...");
    const konseling = await prisma.konseling.create({
      data: {
        siswaId: siswaA.id,
        topik: "Belajar",
        tanggal: new Date("2026-10-28"),
        jam: "10.00 WIB",
        keluhan: "Keluhan rahasia tidak boleh bocor ke kartu",
        status: STATUS_KONSELING.PENDING,
      },
    });

    const activitiesAfterKonseling = await activityService.getStudentRecentActivities(siswaA.id, 5);
    const konselingAct = activitiesAfterKonseling.find(
      (a) => a.id === `konseling-submit-${konseling.id}`
    );

    if (
      konselingAct &&
      konselingAct.title.includes("Pengajuan Konseling: Belajar") &&
      konselingAct.status === "Diajukan" &&
      !konselingAct.description.includes("Keluhan rahasia")
    ) {
      recordResult({
        id: "ACT-03",
        name: "Aktivitas Pengajuan Konseling",
        category: "ACTIVITY",
        status: "PASSED",
        details: "Pengajuan konseling muncul dengan topik dan waktu yang benar tanpa membocorkan isi keluhan.",
      });
    } else {
      recordResult({
        id: "ACT-03",
        name: "Aktivitas Pengajuan Konseling",
        category: "ACTIVITY",
        status: "FAILED",
        details: `Hasil aktivitas konseling: ${JSON.stringify(konselingAct)}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 4: Perubahan status konseling muncul sebagai aktivitas baru
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 4: Pengujian aktivitas pembaruan status Konseling...");
    // Simulasi jeda waktu agar updatedAt berbeda dari createdAt
    await new Promise((resolve) => setTimeout(resolve, 1100));

    await prisma.konseling.update({
      where: { id: konseling.id },
      data: {
        status: STATUS_KONSELING.DISETUJUI,
        catatanGuruBK: "Silakan datang tepat waktu di Ruang BK",
        updatedAt: new Date(),
      },
    });

    const activitiesAfterUpdate = await activityService.getStudentRecentActivities(siswaA.id, 5);
    const statusAct = activitiesAfterUpdate.find(
      (a) => a.id === `konseling-status-${konseling.id}`
    );

    if (
      statusAct &&
      statusAct.title.includes("Konseling Disetujui: Belajar") &&
      statusAct.status === "Disetujui"
    ) {
      recordResult({
        id: "ACT-04",
        name: "Aktivitas Perubahan Status Konseling",
        category: "INTEGRITY",
        status: "PASSED",
        details: "Pembaruan status sesi konseling terdeteksi dan tercatat sebagai aktivitas tersendiri.",
      });
    } else {
      recordResult({
        id: "ACT-04",
        name: "Aktivitas Perubahan Status Konseling",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Aktivitas pembaruan status: ${JSON.stringify(statusAct)}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 5: Pengurutan kronologis descending (Terbaru di atas)
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 5: Pengujian pengurutan kronologis descending...");
    const isSorted = activitiesAfterUpdate.every((item, i) => {
      if (i === 0) return true;
      const prevTime = new Date(activitiesAfterUpdate[i - 1].timestamp).getTime();
      const currTime = new Date(item.timestamp).getTime();
      return prevTime >= currTime;
    });

    if (isSorted && activitiesAfterUpdate.length >= 2) {
      recordResult({
        id: "ACT-05",
        name: "Pengurutan Kronologis Descending",
        category: "INTEGRITY",
        status: "PASSED",
        details: "Seluruh aktivitas terurut sempurna dari yang paling baru ke yang lebih lama.",
      });
    } else {
      recordResult({
        id: "ACT-05",
        name: "Pengurutan Kronologis Descending",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Panjang: ${activitiesAfterUpdate.length}, Terurut: ${isSorted}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 6: Isolasi data antar-siswa (Anti-IDOR)
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 6: Pengujian isolasi data aktivitas antar-siswa...");
    const activitiesB = await activityService.getStudentRecentActivities(siswaB.id, 5);

    if (activitiesB.length === 0) {
      recordResult({
        id: "ACT-06",
        name: "Isolasi Data Siswa (Anti-IDOR)",
        category: "SECURITY",
        status: "PASSED",
        details: "Siswa B tidak dapat melihat aktivitas milik Siswa A (0 aktivitas untuk Siswa B).",
      });
    } else {
      recordResult({
        id: "ACT-06",
        name: "Isolasi Data Siswa (Anti-IDOR)",
        category: "SECURITY",
        status: "FAILED",
        details: `Siswa B bocor aktivitas: ${activitiesB.length}`,
      });
    }
  } finally {
    // Cleanup fixture
    console.log("\n🧹 Membersihkan fixture pengujian aktivitas...");
    if (siswaA!) {
      await prisma.konseling.deleteMany({ where: { siswaId: siswaA.id } });
      await prisma.angketMasalah.deleteMany({ where: { siswaId: siswaA.id } });
      await prisma.siswa.delete({ where: { id: siswaA.id } });
    }
    if (siswaB!) {
      await prisma.siswa.delete({ where: { id: siswaB.id } });
    }
    console.log("✨ Fixture pengujian selesai dibersihkan.");
  }

  console.log("\n===============================================================");
  console.log("📊 RINGKASAN HASIL TEST ACTIVITY SERVICE");
  console.log("===============================================================");
  const passedCount = testReports.filter((r) => r.status === "PASSED").length;
  const failedCount = testReports.filter((r) => r.status === "FAILED").length;
  console.log(`Total Pengujian: ${testReports.length}`);
  console.log(`Lolos (Passed) : ${passedCount}`);
  console.log(`Gagal (Failed) : ${failedCount}`);
  console.log("===============================================================\n");

  await prisma.$disconnect();
  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runActivityServiceTests().catch(async (err) => {
  console.error("Test execution failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
