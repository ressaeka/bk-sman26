import { prisma } from "@/lib/prisma";
import { AngketMasalahService } from "@/services/angket-masalah.service";

interface TestReportItem {
  id: string;
  name: string;
  category: "CONCURRENCY" | "SECURITY" | "INTEGRITY";
  status: "PASSED" | "FAILED";
  details: string;
}

const report: TestReportItem[] = [];

function recordResult(item: TestReportItem) {
  report.push(item);
  console.log(`[${item.status}] [${item.category}] ${item.name} -> ${item.details}`);
}

async function runSecurityRegressionTests() {
  console.log("===============================================================");
  console.log("🛡️  MEMULAI SECURITY REGRESSION & CONCURRENCY VALIDATION (FASE 4)");
  console.log("===============================================================\n");

  const NISN_PREFIX = "SEC_REG_";
  const testNisnA = `${NISN_PREFIX}SISWA_A`;
  const testNisnB = `${NISN_PREFIX}SISWA_B`;

  // 0. CLEANUP AWAL (Jika ada sisa run sebelumnya)
  await prisma.angketMasalah.deleteMany({
    where: { siswa: { nisn: { in: [testNisnA, testNisnB] } } },
  });
  await prisma.siswa.deleteMany({
    where: { nisn: { in: [testNisnA, testNisnB] } },
  });

  // 1. SETUP FIXTURES TERISOLASI
  const siswaA = await prisma.siswa.create({
    data: {
      nisn: testNisnA,
      nama_siswa: "Fixture Siswa Security A",
      rombel: "XII-TEST-A",
    },
  });

  const siswaB = await prisma.siswa.create({
    data: {
      nisn: testNisnB,
      nama_siswa: "Fixture Siswa Security B",
      rombel: "XII-TEST-B",
    },
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Concurrency - Dua Submit Serentak untuk Siswa yang Sama (Pessimistic Locking)
    // ------------------------------------------------------------------------
    const payload1 = [1, 3, 5];
    const payload2 = [7, 9, 11];

    const concurrentResults = await Promise.allSettled([
      AngketMasalahService.submitAssessment(siswaA.id, payload1),
      AngketMasalahService.submitAssessment(siswaA.id, payload2),
    ]);

    const fulfilledCount = concurrentResults.filter((r) => r.status === "fulfilled").length;
    const rejectedCount = concurrentResults.filter((r) => r.status === "rejected").length;
    const dbCountA = await prisma.angketMasalah.count({ where: { siswaId: siswaA.id } });

    const rejectedReason =
      concurrentResults.find((r) => r.status === "rejected")?.status === "rejected"
        ? (concurrentResults.find((r) => r.status === "rejected") as PromiseRejectedResult).reason
            ?.message
        : "";

    if (fulfilledCount === 1 && rejectedCount === 1 && dbCountA === 1) {
      recordResult({
        id: "TC-01",
        name: "Pessimistic Lock Mutual Exclusion",
        category: "CONCURRENCY",
        status: "PASSED",
        details: `Tepat 1 request berhasil, 1 request ditolak dengan pesan: "${rejectedReason}". Database memiliki tepat 1 record.`,
      });
    } else {
      recordResult({
        id: "TC-01",
        name: "Pessimistic Lock Mutual Exclusion",
        category: "CONCURRENCY",
        status: "FAILED",
        details: `Fulfilled: ${fulfilledCount}, Rejected: ${rejectedCount}, DB Count: ${dbCountA}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 2: Concurrency Independensi Antar-Siswa yang Berbeda
    // ------------------------------------------------------------------------
    const resultB = await AngketMasalahService.submitAssessment(siswaB.id, [21, 22]);
    const dbCountB = await prisma.angketMasalah.count({ where: { siswaId: siswaB.id } });

    if (resultB && dbCountB === 1) {
      recordResult({
        id: "TC-02",
        name: "Independensi Lock Antar-Siswa Berbeda",
        category: "CONCURRENCY",
        status: "PASSED",
        details: `Siswa B berhasil submit (ID: ${resultB.id}) tanpa terhambat oleh lock baris Siswa A.`,
      });
    } else {
      recordResult({
        id: "TC-02",
        name: "Independensi Lock Antar-Siswa Berbeda",
        category: "CONCURRENCY",
        status: "FAILED",
        details: `DB Count B: ${dbCountB}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 3: Submit Berulang Pasca Selesai (Sequential Submit Rejection)
    // ------------------------------------------------------------------------
    let sequentialErrorMsg = "";
    try {
      await AngketMasalahService.submitAssessment(siswaA.id, [15, 16]);
    } catch (err: unknown) {
      sequentialErrorMsg = err instanceof Error ? err.message : String(err);
    }

    if (sequentialErrorMsg.includes("sudah pernah mengisi")) {
      recordResult({
        id: "TC-03",
        name: "Penolakan Pengisian Ulang Sekuensial",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Pengisian kedua setelah submit pertama ditolak dengan validasi: "${sequentialErrorMsg}".`,
      });
    } else {
      recordResult({
        id: "TC-03",
        name: "Penolakan Pengisian Ulang Sekuensial",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Error yang muncul: "${sequentialErrorMsg}"`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 4: Validasi Integritas Payload Butir Masalah
    // ------------------------------------------------------------------------
    // Siswa baru C untuk test invalid payload
    const siswaC = await prisma.siswa.create({
      data: {
        nisn: `${NISN_PREFIX}SISWA_C`,
        nama_siswa: "Fixture Siswa C",
      },
    });

    let emptyPayloadError = "";
    try {
      await AngketMasalahService.submitAssessment(siswaC.id, []);
    } catch (err: unknown) {
      emptyPayloadError = err instanceof Error ? err.message : String(err);
    }

    let invalidIdError = "";
    try {
      await AngketMasalahService.submitAssessment(siswaC.id, [99999, -5]);
    } catch (err: unknown) {
      invalidIdError = err instanceof Error ? err.message : String(err);
    }

    const dbCountC = await prisma.angketMasalah.count({ where: { siswaId: siswaC.id } });

    if (emptyPayloadError.includes("minimal 1 butir") && invalidIdError.includes("tidak valid") && dbCountC === 0) {
      recordResult({
        id: "TC-04",
        name: "Validasi Payload & Rollback Data Tidak Valid",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Payload kosong ditolak ("${emptyPayloadError}"), ID fiktif ditolak ("${invalidIdError}"). Tidak ada data parsial tersisa.`,
      });
    } else {
      recordResult({
        id: "TC-04",
        name: "Validasi Payload & Rollback Data Tidak Valid",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Empty err: ${emptyPayloadError}, Invalid ID err: ${invalidIdError}, DB Count C: ${dbCountC}`,
      });
    }

    // Cleanup siswa C
    await prisma.siswa.delete({ where: { id: siswaC.id } });

    // ------------------------------------------------------------------------
    // TEST 5: Kerahasiaan Data Hasil & Grouping
    // ------------------------------------------------------------------------
    const latestResultA = await AngketMasalahService.getLatestResult(siswaA.id);

    if (
      latestResultA &&
      latestResultA.siswaId === siswaA.id &&
      latestResultA.statusReview === "PENDING" &&
      latestResultA.totalMasalahDialami === 3 &&
      Array.isArray(latestResultA.hasilangketMasalah)
    ) {
      recordResult({
        id: "TC-05",
        name: "Format Hasil & Isolasi Siswa",
        category: "SECURITY",
        status: "PASSED",
        details: `Hasil terformat dengan tepat, status PENDING, total butir dialami: 3, hasil grouping kategori valid.`,
      });
    } else {
      recordResult({
        id: "TC-05",
        name: "Format Hasil & Isolasi Siswa",
        category: "SECURITY",
        status: "FAILED",
        details: `Hasil A: ${JSON.stringify(latestResultA)}`,
      });
    }
  } finally {
    // ------------------------------------------------------------------------
    // TEARDOWN KESELURUHAN FIXTURE PENGUJIAN
    // ------------------------------------------------------------------------
    console.log("\n🧹 Membersihkan fixture pengujian dari database...");
    await prisma.angketMasalah.deleteMany({
      where: {
        siswa: {
          nisn: { startsWith: NISN_PREFIX },
        },
      },
    });
    await prisma.siswa.deleteMany({
      where: {
        nisn: { startsWith: NISN_PREFIX },
      },
    });
    await prisma.$disconnect();
    console.log("✨ Fixture pengujian selesai dibersihkan.\n");
  }

  console.log("===============================================================");
  console.log("📊 RINGKASAN HASIL REGRESSION TEST");
  console.log("===============================================================");
  const allPassed = report.every((r) => r.status === "PASSED");
  console.log(`Total Pengujian: ${report.length}`);
  console.log(`Lolos (Passed) : ${report.filter((r) => r.status === "PASSED").length}`);
  console.log(`Gagal (Failed) : ${report.filter((r) => r.status === "FAILED").length}`);
  console.log(`Status Akhir   : ${allPassed ? "✅ SEMUA PENGUJIAN LOLOS DENGAN BAIK" : "❌ ADA PENGUJIAN GAGAL"}`);
  console.log("===============================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runSecurityRegressionTests().catch((err) => {
  console.error("Fatal error during test run:", err);
  process.exit(1);
});
