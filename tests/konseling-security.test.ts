import { prisma } from "@/lib/prisma";
import { konselingService } from "@/services/konseling.service";
import { STATUS_KONSELING } from "@/constants/konseling.constant";

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

async function runKonselingRegressionTests() {
  console.log("===============================================================");
  console.log("🛡️  MEMULAI KONSELING REGRESSION & CONCURRENCY TEST (FASE 6)");
  console.log("===============================================================\n");

  const PREFIX = "KONSELING_TEST_";
  const nisnA = `${PREFIX}SISWA_A`;
  const nisnB = `${PREFIX}SISWA_B`;
  const nipBK1 = `${PREFIX}BK_1`;
  const nipBK2 = `${PREFIX}BK_2`;

  // 0. CLEANUP AWAL
  await prisma.konseling.deleteMany({
    where: {
      OR: [
        { siswa: { nisn: { in: [nisnA, nisnB] } } },
        { counselor: { nip: { in: [nipBK1, nipBK2] } } },
      ],
    },
  });
  await prisma.siswa.deleteMany({ where: { nisn: { in: [nisnA, nisnB] } } });
  await prisma.counselor.deleteMany({ where: { nip: { in: [nipBK1, nipBK2] } } });

  // 1. SETUP FIXTURES
  const siswaA = await prisma.siswa.create({
    data: { nisn: nisnA, nama_siswa: "Fixture Siswa Konseling A", rombel: "XII-TEST-A" },
  });
  const siswaB = await prisma.siswa.create({
    data: { nisn: nisnB, nama_siswa: "Fixture Siswa Konseling B", rombel: "XII-TEST-B" },
  });
  const counselor1 = await prisma.counselor.create({
    data: { nip: nipBK1, nama_counselor: "Fixture Guru BK 1" },
  });
  const counselor2 = await prisma.counselor.create({
    data: { nip: nipBK2, nama_counselor: "Fixture Guru BK 2" },
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Concurrency - Dua Pengajuan Serentak untuk Siswa yang Sama
    // ------------------------------------------------------------------------
    console.log("🧪 UJI 1: Mengirim 2 request pengajuan konseling serentak untuk Siswa A...");
    const req1 = konselingService.createSession(siswaA.id, {
      tanggal: "2026-10-27",
      jam: "10.00 WIB",
      topik: "Belajar",
      keluhan: "Keluhan A1",
    });
    const req2 = konselingService.createSession(siswaA.id, {
      tanggal: "2026-10-28",
      jam: "11.00 WIB",
      topik: "Karier",
      keluhan: "Keluhan A2",
    });

    const submitResults = await Promise.allSettled([req1, req2]);
    const fulfilledSubmit = submitResults.filter((r) => r.status === "fulfilled");
    const rejectedSubmit = submitResults.filter((r) => r.status === "rejected");
    const dbCountA = await prisma.konseling.count({ where: { siswaId: siswaA.id } });

    if (fulfilledSubmit.length === 1 && rejectedSubmit.length === 1 && dbCountA === 1) {
      recordResult({
        id: "TC-K01",
        name: "Pessimistic Lock Double-Submission Konseling",
        category: "CONCURRENCY",
        status: "PASSED",
        details: "Tepat 1 pengajuan berhasil dibuat, 1 pengajuan ditolak karena sudah memiliki sesi aktif. Total di DB: 1.",
      });
    } else {
      recordResult({
        id: "TC-K01",
        name: "Pessimistic Lock Double-Submission Konseling",
        category: "CONCURRENCY",
        status: "FAILED",
        details: `Fulfilled: ${fulfilledSubmit.length}, Rejected: ${rejectedSubmit.length}, DB Count: ${dbCountA}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 2: Independensi Pengajuan untuk Siswa Berbeda
    // ------------------------------------------------------------------------
    const sessionB = await konselingService.createSession(siswaB.id, {
      tanggal: "2026-10-27",
      jam: "10.00 WIB",
      topik: "Sosial",
      keluhan: "Keluhan Siswa B",
    });
    const dbCountB = await prisma.konseling.count({ where: { siswaId: siswaB.id } });

    if (sessionB && dbCountB === 1) {
      recordResult({
        id: "TC-K02",
        name: "Independensi Pengajuan Antar-Siswa",
        category: "CONCURRENCY",
        status: "PASSED",
        details: `Siswa B berhasil mengajukan sesi (ID: ${sessionB.id}) tanpa terhambat oleh lock Siswa A.`,
      });
    } else {
      recordResult({
        id: "TC-K02",
        name: "Independensi Pengajuan Antar-Siswa",
        category: "CONCURRENCY",
        status: "FAILED",
        details: `DB Count B: ${dbCountB}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 3: Pencegahan Bentrok Jadwal Persetujuan Guru BK (Conflict Approval)
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 3: Pengujian bentrok persetujuan jadwal untuk Guru BK 1...");
    // Sesi A disetujui untuk Guru BK 1 pada tanggal 2026-10-27 jam 10.00 WIB
    const sessionAId = (fulfilledSubmit[0] as PromiseFulfilledResult<{ id: number }>).value.id;
    await konselingService.updateSessionStatus(sessionAId, counselor1.id, STATUS_KONSELING.DISETUJUI, "Silakan datang ke ruang BK");

    // Sekarang coba setujui Sesi B yang memiliki tanggal dan jam yang sama untuk Guru BK 1
    let conflictErrorMsg = "";
    try {
      await konselingService.updateSessionStatus(sessionB.id, counselor1.id, STATUS_KONSELING.DISETUJUI, "Bentrok");
    } catch (err: unknown) {
      conflictErrorMsg = err instanceof Error ? err.message : String(err);
    }

    if (conflictErrorMsg.includes("sudah memiliki jadwal konseling")) {
      recordResult({
        id: "TC-K03",
        name: "Pencegahan Bentrok Jadwal Guru BK",
        category: "CONCURRENCY",
        status: "PASSED",
        details: `Persetujuan sesi kedua pada slot jam yang sama berhasil ditolak dengan pesan: "${conflictErrorMsg}".`,
      });
    } else {
      recordResult({
        id: "TC-K03",
        name: "Pencegahan Bentrok Jadwal Guru BK",
        category: "CONCURRENCY",
        status: "FAILED",
        details: `Error yang muncul: "${conflictErrorMsg}"`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 4: Persetujuan untuk Guru BK Lain pada Jam Sama (Independen jika beda Guru)
    // ------------------------------------------------------------------------
    const approvedBWithBK2 = await konselingService.updateSessionStatus(
      sessionB.id,
      counselor2.id,
      STATUS_KONSELING.DISETUJUI,
      "Disetujui oleh Guru BK 2"
    );

    if (approvedBWithBK2.status === STATUS_KONSELING.DISETUJUI && approvedBWithBK2.counselor?.id === counselor2.id) {
      recordResult({
        id: "TC-K04",
        name: "Persetujuan Sesi pada Guru BK Berbeda",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Sesi B berhasil disetujui untuk Guru BK 2 pada slot waktu yang sama karena ditangani konselor berbeda.`,
      });
    } else {
      recordResult({
        id: "TC-K04",
        name: "Persetujuan Sesi pada Guru BK Berbeda",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Status Sesi B: ${approvedBWithBK2.status}`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 5: Detail Siswa & Pencegahan IDOR
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 5: Pengujian detail sesi & IDOR...");
    // Siswa A baca sesi miliknya sendiri
    const detailA = await konselingService.getSiswaSessionById(sessionAId, siswaA.id);
    const isDetailAValid = detailA.id === sessionAId && detailA.siswaId === siswaA.id;

    // Siswa B coba baca sesi milik Siswa A (IDOR attempt)
    let idorErrorMsg = "";
    try {
      await konselingService.getSiswaSessionById(sessionAId, siswaB.id);
    } catch (err: unknown) {
      idorErrorMsg = err instanceof Error ? err.message : String(err);
    }

    if (isDetailAValid && idorErrorMsg.includes("tidak ditemukan")) {
      recordResult({
        id: "TC-K05",
        name: "Proteksi IDOR Detail Sesi Siswa",
        category: "SECURITY",
        status: "PASSED",
        details: "Siswa A sukses membaca miliknya, Siswa B ditolak dengan HTTP 404 (tidak ditemukan).",
      });
    } else {
      recordResult({
        id: "TC-K05",
        name: "Proteksi IDOR Detail Sesi Siswa",
        category: "SECURITY",
        status: "FAILED",
        details: `Detail A: ${Boolean(detailA)}, IDOR Error: "${idorErrorMsg}"`,
      });
    }

    // ------------------------------------------------------------------------
    // TEST 6: Pembatalan Pengajuan oleh Siswa
    // ------------------------------------------------------------------------
    console.log("\n🧪 UJI 6: Pengujian pembatalan sesi oleh siswa...");
    // Buat siswa C baru dengan sesi PENDING
    const siswaC = await prisma.siswa.create({
      data: { nisn: `${PREFIX}SISWA_C`, nama_siswa: "Fixture Siswa C", rombel: "X-TEST-C" },
    });
    const sessionC = await konselingService.createSession(siswaC.id, {
      tanggal: "2026-10-30",
      jam: "09.00 WIB",
      topik: "Lainnya",
      keluhan: "Keluhan Siswa C",
    });

    // Siswa C membatalkan sesi miliknya yang masih PENDING
    const cancelledC = await konselingService.cancelSessionBySiswa(sessionC.id, siswaC.id);

    // Coba batalkan lagi sesi yang sudah dibatalkan
    let doubleCancelError = "";
    try {
      await konselingService.cancelSessionBySiswa(sessionC.id, siswaC.id);
    } catch (err: unknown) {
      doubleCancelError = err instanceof Error ? err.message : String(err);
    }

    // Siswa coba batalkan sesi A yang sudah berstatus DISETUJUI
    let cancelApprovedError = "";
    try {
      await konselingService.cancelSessionBySiswa(sessionAId, siswaA.id);
    } catch (err: unknown) {
      cancelApprovedError = err instanceof Error ? err.message : String(err);
    }

    const isCancelCSuccess =
      cancelledC.status === STATUS_KONSELING.DITOLAK &&
      cancelledC.catatanGuruBK === "Dibatalkan oleh siswa";

    if (
      isCancelCSuccess &&
      doubleCancelError.includes("tidak dapat dibatalkan") &&
      cancelApprovedError.includes("tidak dapat dibatalkan")
    ) {
      recordResult({
        id: "TC-K06",
        name: "Integritas Alur Pembatalan Siswa",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Sesi PENDING berhasil dibatalkan menjadi DITOLAK. Pembatalan ulang ditolak. Pembatalan sesi yang sudah DISETUJUI ditolak secara tegas.`,
      });
    } else {
      recordResult({
        id: "TC-K06",
        name: "Integritas Alur Pembatalan Siswa",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Cancel C: ${isCancelCSuccess}, Double Cancel Err: "${doubleCancelError}", Cancel Approved Err: "${cancelApprovedError}"`,
      });
    }

    // Cleanup Siswa C
    await prisma.konseling.deleteMany({ where: { siswaId: siswaC.id } });
    await prisma.siswa.delete({ where: { id: siswaC.id } });
  } finally {
    // ------------------------------------------------------------------------
    // TEARDOWN KESELURUHAN FIXTURE PENGUJIAN
    // ------------------------------------------------------------------------
    console.log("\n🧹 Membersihkan fixture pengujian konseling dari database...");
    await prisma.konseling.deleteMany({
      where: {
        OR: [
          { siswa: { nisn: { startsWith: PREFIX } } },
          { counselor: { nip: { startsWith: PREFIX } } },
        ],
      },
    });
    await prisma.siswa.deleteMany({ where: { nisn: { startsWith: PREFIX } } });
    await prisma.counselor.deleteMany({ where: { nip: { startsWith: PREFIX } } });
    await prisma.$disconnect();
    console.log("✨ Fixture pengujian selesai dibersihkan.\n");
  }

  console.log("===============================================================");
  console.log("📊 RINGKASAN HASIL KONSELING REGRESSION TEST");
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

runKonselingRegressionTests().catch((err) => {
  console.error("Fatal error during test run:", err);
  process.exit(1);
});
