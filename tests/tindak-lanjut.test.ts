import { prisma } from "../src/lib/prisma";
import { pelanggaranService } from "../src/services/pelanggaran.service";
import { pelanggaranRepository } from "../src/repositories/pelanggaran.repository";
import { dashboardRepository } from "../src/repositories/dashboard.repository";
import {
  GET as getFollowUpRoute,
  POST as postFollowUpRoute,
  PATCH as patchFollowUpRoute,
} from "../src/app/api/bk/pelanggaran/[id]/tindak-lanjut/route";
import { AUTH_CONSTANTS } from "../src/constants/auth.constant";
import { NextRequest } from "next/server";
import crypto from "crypto";

interface TestReport {
  id: string;
  name: string;
  type: "UNIT" | "INTEGRATION";
  category: "SECURITY" | "VALIDATION" | "TRANSITION" | "INTEGRITY" | "CONCURRENCY" | "TRANSACTION";
  status: "PASSED" | "FAILED";
  details: string;
}

const testReports: TestReport[] = [];

function recordResult(report: TestReport) {
  testReports.push(report);
  const icon = report.status === "PASSED" ? "✅ [PASSED]" : "❌ [FAILED]";
  console.log(`${icon} [${report.type}] [${report.category}] ${report.name} -> ${report.details}`);
}

async function runTindakLanjutTests() {
  console.log("===================================================================");
  console.log("🚀 MEMULAI PENGUJIAN REGRESI MODUL TINDAK LANJUT PELANGGARAN SI-BK-26");
  console.log("===================================================================");

  const timestamp = Date.now();
  let counselorId: number | undefined;
  let testSiswaId: number | undefined;
  let testPelanggaranId: number | undefined;
  let testPelanggaran2Id: number | undefined;
  let testPelanggaranCancelledId: number | undefined;
  let testPelanggaranRaceId: number | undefined;
  let counselorUserId: number | undefined;
  let siswaUserId: number | undefined;
  let bkSessionToken: string | undefined;
  let siswaSessionToken: string | undefined;

  try {
    // 0. Ambil role dari DB
    const roleBk = await prisma.role.findFirst({ where: { nama_role: "BK" } });
    const roleSiswa = await prisma.role.findFirst({ where: { nama_role: "SISWA" } });

    if (!roleBk || !roleSiswa) {
      throw new Error("Role BK atau SISWA belum ada di database.");
    }

    // 0. Setup Counselor & Siswa Uji
    const counselor = await prisma.counselor.create({
      data: {
        nama_counselor: `Guru BK Test TL ${timestamp}`,
        nip: `1980${String(timestamp).slice(-14)}`,
      },
    });
    counselorId = counselor.id;

    const counselorUser = await prisma.user.create({
      data: {
        username: `bk_test_${timestamp}`,
        passwordHash: "dummy_hash",
        roleId: roleBk.id,
        counselorId: counselor.id,
      },
    });
    counselorUserId = counselorUser.id;

    const siswa = await prisma.siswa.create({
      data: {
        nisn: `889${String(timestamp).slice(-6)}`,
        nama_siswa: `Siswa TL Test ${timestamp}`,
        rombel: "XII-MIPA-1",
        totalPoin: 35, // Peringatan I (25-49 poin)
      },
    });
    testSiswaId = siswa.id;

    const siswaUser = await prisma.user.create({
      data: {
        username: `siswa_test_${timestamp}`,
        passwordHash: "dummy_hash",
        roleId: roleSiswa.id,
        siswaId: siswa.id,
      },
    });
    siswaUserId = siswaUser.id;

    // Pelanggaran 1: Uji alur transisi status dan perlindungan tindakan
    const p1 = await prisma.pelanggaran.create({
      data: {
        siswaId: siswa.id,
        counselorId: counselor.id,
        jenisPelanggaran: "Membawa barang terlarang (non-senjata/narkoba)",
        poin: 15,
        statusTindakLanjut: "BELUM_DITANGANI",
      },
    });
    testPelanggaranId = p1.id;

    // Pelanggaran 2: Uji transisi status khusus pembatalan
    const p2 = await prisma.pelanggaran.create({
      data: {
        siswaId: siswa.id,
        counselorId: counselor.id,
        jenisPelanggaran: "Atribut seragam tidak lengkap",
        poin: 5,
        statusTindakLanjut: "BELUM_DITANGANI",
      },
    });
    testPelanggaran2Id = p2.id;

    // Pelanggaran 3: Uji dashboard filter DIBATALKAN
    const pCancelled = await prisma.pelanggaran.create({
      data: {
        siswaId: siswa.id,
        counselorId: counselor.id,
        jenisPelanggaran: "Pelanggaran Dibatalkan Khusus Dashboard Test",
        poin: 10,
        statusTindakLanjut: "DIBATALKAN",
      },
    });
    testPelanggaranCancelledId = pCancelled.id;

    // Pelanggaran 4: Uji concurrency / race condition
    const pRace = await prisma.pelanggaran.create({
      data: {
        siswaId: siswa.id,
        counselorId: counselor.id,
        jenisPelanggaran: "Uji Race Condition Dua Request Bersamaan",
        poin: 10,
        statusTindakLanjut: "BELUM_DITANGANI",
      },
    });
    testPelanggaranRaceId = pRace.id;

    // Buat session tokens
    bkSessionToken = crypto.randomBytes(32).toString("hex");
    const bkTokenHash = crypto.createHash("sha256").update(bkSessionToken).digest("hex");
    await prisma.session.create({
      data: {
        userId: counselorUser.id,
        tokenHash: bkTokenHash,
        expiresAt: new Date(Date.now() + 7200000),
      },
    });

    siswaSessionToken = crypto.randomBytes(32).toString("hex");
    const siswaTokenHash = crypto.createHash("sha256").update(siswaSessionToken).digest("hex");
    await prisma.session.create({
      data: {
        userId: siswaUser.id,
        tokenHash: siswaTokenHash,
        expiresAt: new Date(Date.now() + 7200000),
      },
    });

    const bkCookieHeader = `${AUTH_CONSTANTS.SESSION_COOKIE_NAME}=${bkSessionToken}`;
    const siswaCookieHeader = `${AUTH_CONSTANTS.SESSION_COOKIE_NAME}=${siswaSessionToken}`;

    // =========================================================================
    // SKENARIO 13: Otorisasi 401, 403, dan Sumber counselorId Server Session
    // =========================================================================
    {
      // 13a. Anonymous access -> HTTP 401
      const reqAnon = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "GET",
      });
      const resAnon = await getFollowUpRoute(reqAnon, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      recordResult({
        id: "TEST-13A",
        name: "Anonymous Access Rejected",
        type: "INTEGRATION",
        category: "SECURITY",
        status: resAnon.status === 401 ? "PASSED" : "FAILED",
        details: `Ekspektasi HTTP 401, hasil: HTTP ${resAnon.status}`,
      });

      // 13b. Siswa role access -> HTTP 403
      const reqSiswa = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "GET",
        headers: { Cookie: siswaCookieHeader },
      });
      const resSiswa = await getFollowUpRoute(reqSiswa, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      recordResult({
        id: "TEST-13B",
        name: "Siswa Forbidden from BK Follow-Up Data",
        type: "INTEGRATION",
        category: "SECURITY",
        status: resSiswa.status === 403 ? "PASSED" : "FAILED",
        details: `Ekspektasi HTTP 403, hasil: HTTP ${resSiswa.status}`,
      });
    }

    // =========================================================================
    // SKENARIO 6: PATCH tanpa alasan atau alasan < 5 karakter ditolak (HTTP 400)
    // =========================================================================
    {
      // 6a. Tanpa alasan (kosong)
      const reqEmpty = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "   ",
        }),
      });
      const resEmpty = await patchFollowUpRoute(reqEmpty, { params: Promise.resolve({ id: String(testPelanggaranId) }) });

      // 6b. Alasan terlalu pendek (< 5 karakter)
      const reqShort = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "oke",
        }),
      });
      const resShort = await patchFollowUpRoute(reqShort, { params: Promise.resolve({ id: String(testPelanggaranId) }) });

      const passed = resEmpty.status === 400 && resShort.status === 400;
      recordResult({
        id: "TEST-06",
        name: "Mandatory Reason with Minimum 5 Characters Enforced",
        type: "INTEGRATION",
        category: "VALIDATION",
        status: passed ? "PASSED" : "FAILED",
        details: `Status kosong: ${resEmpty.status}, status pendek: ${resShort.status} (keduanya wajib 400)`,
      });
    }

    // =========================================================================
    // SKENARIO 1: Transisi yang diizinkan berhasil (HTTP 200)
    // BELUM_DITANGANI -> DALAM_PEMBINAAN -> SELESAI
    // =========================================================================
    {
      // 1a. BELUM_DITANGANI -> DALAM_PEMBINAAN
      const req1 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "Mulai pembinaan konseling individual terstruktur",
        }),
      });
      const res1 = await patchFollowUpRoute(req1, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      const json1 = await res1.json();

      // 1b. DALAM_PEMBINAAN -> SELESAI
      const req2 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SELESAI",
          catatanPerubahan: "Siswa telah menyelesaikan seluruh pembinaan dan berkomitmen baik",
        }),
      });
      const res2 = await patchFollowUpRoute(req2, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      const json2 = await res2.json();

      const passed = res1.status === 200 && json1.data?.status === "DALAM_PEMBINAAN" &&
                     res2.status === 200 && json2.data?.status === "SELESAI";

      recordResult({
        id: "TEST-01",
        name: "Allowed Status Transitions Succeed",
        type: "INTEGRATION",
        category: "TRANSITION",
        status: passed ? "PASSED" : "FAILED",
        details: `BELUM_DITANGANI -> DALAM_PEMBINAAN (${res1.status}) -> SELESAI (${res2.status})`,
      });
    }

    // =========================================================================
    // SKENARIO 2: Transisi ilegal ditolak dengan HTTP 400
    // SELESAI -> BELUM_DITANGANI atau SELESAI -> DIBATALKAN
    // =========================================================================
    {
      const reqIllegal1 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "BELUM_DITANGANI",
          catatanPerubahan: "Mencoba mengembalikan status selesai ke belum ditangani",
        }),
      });
      const resIllegal1 = await patchFollowUpRoute(reqIllegal1, { params: Promise.resolve({ id: String(testPelanggaranId) }) });

      const reqIllegal2 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DIBATALKAN",
          catatanPerubahan: "Mencoba membatalkan kasus yang sudah berstatus selesai",
        }),
      });
      const resIllegal2 = await patchFollowUpRoute(reqIllegal2, { params: Promise.resolve({ id: String(testPelanggaranId) }) });

      const passed = resIllegal1.status === 400 && resIllegal2.status === 400;
      recordResult({
        id: "TEST-02",
        name: "Illegal Transitions Rejected with HTTP 400",
        type: "INTEGRATION",
        category: "TRANSITION",
        status: passed ? "PASSED" : "FAILED",
        details: `SELESAI -> BELUM_DITANGANI (${resIllegal1.status}), SELESAI -> DIBATALKAN (${resIllegal2.status})`,
      });
    }

    // =========================================================================
    // SKENARIO 3: Transisi ke status yang sama ditolak (HTTP 400)
    // =========================================================================
    {
      const reqSame = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SELESAI",
          catatanPerubahan: "Mencoba mengirim status yang sama persis",
        }),
      });
      const resSame = await patchFollowUpRoute(reqSame, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      const jsonSame = await resSame.json();

      const passed = resSame.status === 400 && String(jsonSame.message).includes("sudah SELESAI");
      recordResult({
        id: "TEST-03",
        name: "Same Status Transition Rejected as Redundant",
        type: "INTEGRATION",
        category: "TRANSITION",
        status: passed ? "PASSED" : "FAILED",
        details: `Ekspektasi HTTP 400, pesan: "${jsonSame.message}"`,
      });
    }

    // =========================================================================
    // SKENARIO 4: SELESAI hanya bisa dibuka kembali ke DALAM_PEMBINAAN dengan alasan
    // =========================================================================
    {
      const reqReopen = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "Kasus dibuka kembali karena ada indikasi pelanggaran susulan",
        }),
      });
      const resReopen = await patchFollowUpRoute(reqReopen, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      await resReopen.json();

      const dbCheck = await prisma.pelanggaran.findUnique({ where: { id: testPelanggaranId } });
      const passed = resReopen.status === 200 && dbCheck?.statusTindakLanjut === "DALAM_PEMBINAAN";

      recordResult({
        id: "TEST-04",
        name: "SELESAI Can Explicitly Reopen to DALAM_PEMBINAAN",
        type: "INTEGRATION",
        category: "TRANSITION",
        status: passed ? "PASSED" : "FAILED",
        details: `Kasus SELESAI berhasil dibuka kembali ke DALAM_PEMBINAAN (HTTP ${resReopen.status})`,
      });
    }

    // =========================================================================
    // SKENARIO 5: DIBATALKAN tidak bisa langsung berpindah status
    // =========================================================================
    {
      // Ubah p2 menjadi DIBATALKAN terlebih dahulu (transisi sah: BELUM_DITANGANI -> DIBATALKAN)
      await pelanggaranService.updateStatusKasus(
        testPelanggaran2Id,
        {
          status: "DIBATALKAN",
          catatanPerubahan: "Pembatalan kasus karena kekeliruan identifikasi siswa",
        },
        counselor.id
      );

      // Coba pindahkan DIBATALKAN ke BELUM_DITANGANI
      const reqCancel1 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaran2Id}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "BELUM_DITANGANI",
          catatanPerubahan: "Mencoba memulihkan kasus yang sudah dibatalkan",
        }),
      });
      const resCancel1 = await patchFollowUpRoute(reqCancel1, { params: Promise.resolve({ id: String(testPelanggaran2Id) }) });

      // Coba pindahkan DIBATALKAN ke DALAM_PEMBINAAN
      const reqCancel2 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaran2Id}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "Mencoba mengaktifkan kasus dibatalkan ke pembinaan",
        }),
      });
      const resCancel2 = await patchFollowUpRoute(reqCancel2, { params: Promise.resolve({ id: String(testPelanggaran2Id) }) });

      const passed = resCancel1.status === 400 && resCancel2.status === 400;
      recordResult({
        id: "TEST-05",
        name: "DIBATALKAN Status Locked from Direct Transitions",
        type: "INTEGRATION",
        category: "TRANSITION",
        status: passed ? "PASSED" : "FAILED",
        details: `DIBATALKAN -> BELUM_DITANGANI (${resCancel1.status}), DIBATALKAN -> DALAM_PEMBINAAN (${resCancel2.status})`,
      });
    }

    // =========================================================================
    // SKENARIO 7: Rollback transaksi jika penulisan audit log gagal
    // =========================================================================
    {
      const currentCase = await prisma.pelanggaran.findUnique({ where: { id: testPelanggaranId } });
      const statusBefore = currentCase?.statusTindakLanjut; // DALAM_PEMBINAAN

      let failedCaught = false;
      try {
        // Coba panggil updateStatusKasus dengan counselorId yang melanggar foreign key (999999999)
        await pelanggaranRepository.updateStatusKasus({
          pelanggaranId: testPelanggaranId,
          status: "SELESAI",
          counselorId: 999999999, // ID konselor fiktif melanggar relasi FK
          catatanPerubahan: "Uji rollback kegagalan audit log",
        });
      } catch {
        failedCaught = true;
      }

      // Verifikasi status pelanggaran di database TIDAK BERUBAH (tetap DALAM_PEMBINAAN)
      const checkAfter = await prisma.pelanggaran.findUnique({ where: { id: testPelanggaranId } });
      const rolledBack = failedCaught && checkAfter?.statusTindakLanjut === statusBefore;

      recordResult({
        id: "TEST-07",
        name: "Status Change Transaction Rollback on Audit Failure",
        type: "INTEGRATION",
        category: "TRANSACTION",
        status: rolledBack ? "PASSED" : "FAILED",
        details: `Status tetap ${checkAfter?.statusTindakLanjut} setelah error audit log (Rollback terkonfirmasi)`,
      });
    }

    // =========================================================================
    // SKENARIO 8: Penambahan tindakan pada kasus SELESAI ditolak (HTTP 400)
    // =========================================================================
    {
      // Ubah testPelanggaranId ke SELESAI terlebih dahulu
      await pelanggaranService.updateStatusKasus(
        testPelanggaranId,
        {
          status: "SELESAI",
          catatanPerubahan: "Menutup kasus sebelum pengujian penolakan tindakan",
        },
        counselor.id
      );

      const reqPostClosed = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranId}/tindak-lanjut`, {
        method: "POST",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          bentukTindakan: "KONSELING_INDIVIDUAL",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: "2026-10-24",
          catatan: "Mencoba mencatat tindakan pada kasus yang telah selesai",
        }),
      });
      const resPostClosed = await postFollowUpRoute(reqPostClosed, { params: Promise.resolve({ id: String(testPelanggaranId) }) });
      const jsonClosed = await resPostClosed.json();

      const passed = resPostClosed.status === 400 && String(jsonClosed.message).includes("SELESAI");
      recordResult({
        id: "TEST-08",
        name: "Action Addition on SELESAI Case Rejected",
        type: "INTEGRATION",
        category: "VALIDATION",
        status: passed ? "PASSED" : "FAILED",
        details: `HTTP ${resPostClosed.status}: "${jsonClosed.message}"`,
      });
    }

    // =========================================================================
    // SKENARIO 9: Penambahan tindakan pada kasus DIBATALKAN ditolak (HTTP 400)
    // =========================================================================
    {
      const reqPostCancelled = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaran2Id}/tindak-lanjut`, {
        method: "POST",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          bentukTindakan: "PEMANGGILAN_SISWA",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: "2026-10-24",
          catatan: "Mencoba mencatat tindakan pada kasus yang telah dibatalkan",
        }),
      });
      const resPostCancelled = await postFollowUpRoute(reqPostCancelled, { params: Promise.resolve({ id: String(testPelanggaran2Id) }) });
      const jsonCancelled = await resPostCancelled.json();

      const passed = resPostCancelled.status === 400 && String(jsonCancelled.message).includes("DIBATALKAN");
      recordResult({
        id: "TEST-09",
        name: "Action Addition on DIBATALKAN Case Rejected",
        type: "INTEGRATION",
        category: "VALIDATION",
        status: passed ? "PASSED" : "FAILED",
        details: `HTTP ${resPostCancelled.status}: "${jsonCancelled.message}"`,
      });
    }

    // =========================================================================
    // SKENARIO 10: Kasus DIBATALKAN dikecualikan dari grafik tren & distribusi kategori
    // =========================================================================
    {
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 3600 * 1000);
      const trendList = await dashboardRepository.getViolationsSince(sixMonthsAgo);
      const categoryList = await dashboardRepository.getAllViolationsForCategoryDistribution();

      const inTrend = trendList.some((v) => v.id === testPelanggaranCancelledId);
      const inCategory = categoryList.some((v) => v.jenisPelanggaran === "Pelanggaran Dibatalkan Khusus Dashboard Test");

      const passed = !inTrend && !inCategory;
      recordResult({
        id: "TEST-10",
        name: "Cancelled Cases Excluded from Trends and Distribution",
        type: "INTEGRATION",
        category: "INTEGRITY",
        status: passed ? "PASSED" : "FAILED",
        details: `Kasus dibatalkan ada di tren: ${inTrend}, ada di kategori: ${inCategory} (keduanya wajib false)`,
      });
    }

    // =========================================================================
    // SKENARIO 11: Rekap administratif tetap menghitung kasus DIBATALKAN
    // =========================================================================
    {
      const breakdown = await dashboardRepository.getViolationFollowUpBreakdown();
      const stats = await pelanggaranRepository.getFollowUpStats();

      const passed = breakdown.dibatalkan >= 2 && stats.dibatalkan >= 2;
      recordResult({
        id: "TEST-11",
        name: "Administrative Breakdown Accurately Counts DIBATALKAN Cases",
        type: "INTEGRATION",
        category: "INTEGRITY",
        status: passed ? "PASSED" : "FAILED",
        details: `dashboardRepo dibatalkan: ${breakdown.dibatalkan}, pelanggaranRepo dibatalkan: ${stats.dibatalkan}`,
      });
    }

    // =========================================================================
    // SKENARIO 12: siswa.totalPoin tetap utuh setelah penyelesaian/pembukaan kembali kasus
    // =========================================================================
    {
      const siswaBefore = await prisma.siswa.findUnique({ where: { id: testSiswaId } });
      const poinBefore = siswaBefore?.totalPoin;

      // Buka kembali kasus (SELESAI -> DALAM_PEMBINAAN)
      await pelanggaranService.updateStatusKasus(
        testPelanggaranId,
        {
          status: "DALAM_PEMBINAAN",
          catatanPerubahan: "Buka kembali kasus untuk pengujian keutuhan poin siswa",
        },
        counselor.id
      );

      const siswaMid = await prisma.siswa.findUnique({ where: { id: testSiswaId } });

      // Selesaikan kembali kasus (DALAM_PEMBINAAN -> SELESAI)
      await pelanggaranService.updateStatusKasus(
        testPelanggaranId,
        {
          status: "SELESAI",
          catatanPerubahan: "Selesaikan kembali kasus untuk verifikasi poin tetap utuh",
        },
        counselor.id
      );

      const siswaAfter = await prisma.siswa.findUnique({ where: { id: testSiswaId } });

      const passed = poinBefore === 35 && siswaMid?.totalPoin === 35 && siswaAfter?.totalPoin === 35;
      recordResult({
        id: "TEST-12",
        name: "Student Total DSS Points Preserved Intact",
        type: "INTEGRATION",
        category: "INTEGRITY",
        status: passed ? "PASSED" : "FAILED",
        details: `Awal: ${poinBefore}, saat buka kembali: ${siswaMid?.totalPoin}, setelah selesai: ${siswaAfter?.totalPoin}`,
      });
    }

    // =========================================================================
    // SKENARIO 14: Dua request bersamaan (concurrency) tidak merusak aturan bisnis
    // =========================================================================
    {
      // Kasus testPelanggaranRaceId berstatus BELUM_DITANGANI.
      // Kirim dua request PATCH bersamaan: satu ke SELESAI, satu lagi ke DIBATALKAN.
      const reqA = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranRaceId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SELESAI",
          catatanPerubahan: "Permintaan A: Selesaikan kasus secara bersamaan",
        }),
      });

      const reqB = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${testPelanggaranRaceId}/tindak-lanjut`, {
        method: "PATCH",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DIBATALKAN",
          catatanPerubahan: "Permintaan B: Batalkan kasus secara bersamaan",
        }),
      });

      const [resA, resB] = await Promise.all([
        patchFollowUpRoute(reqA, { params: Promise.resolve({ id: String(testPelanggaranRaceId) }) }),
        patchFollowUpRoute(reqB, { params: Promise.resolve({ id: String(testPelanggaranRaceId) }) }),
      ]);

      const finalCase = await prisma.pelanggaran.findUnique({ where: { id: testPelanggaranRaceId } });

      // Satu request harus berhasil (200) dan yang kedua harus ditolak dengan konflik (409) atau validasi transisi (400)
      const oneSucceeded =
        (resA.status === 200 && (resB.status === 409 || resB.status === 400)) ||
        ((resA.status === 409 || resA.status === 400) && resB.status === 200);
      const finalStatusValid = finalCase?.statusTindakLanjut === "SELESAI" || finalCase?.statusTindakLanjut === "DIBATALKAN";

      const passed = oneSucceeded && finalStatusValid;
      recordResult({
        id: "TEST-14",
        name: "Concurrent Requests Handled Safely with Concurrency Conflict Rejection",
        type: "INTEGRATION",
        category: "CONCURRENCY",
        status: passed ? "PASSED" : "FAILED",
        details: `Req A: ${resA.status}, Req B: ${resB.status}, Status akhir di DB: ${finalCase?.statusTindakLanjut}`,
      });
    }

    // =========================================================================
    // SKENARIO 15: Penolakan Catatan Tindakan Biasa yang Memalsukan Prefix Audit
    // =========================================================================
    {
      // Buat pelanggaran aktif untuk pengujian penolakan prefix audit
      const pActive = await prisma.pelanggaran.create({
        data: {
          siswaId: testSiswaId,
          counselorId: counselorId,
          jenisPelanggaran: "Uji Validasi Prefix Audit Log",
          poin: 10,
          statusTindakLanjut: "BELUM_DITANGANI",
        },
      });

      // 15a. Coba input tindakan dengan prefix [AUDIT_STATUS]
      const reqSpoof1 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${pActive.id}/tindak-lanjut`, {
        method: "POST",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          bentukTindakan: "PEMANGGILAN_SISWA",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: "2026-10-24",
          catatan: "[AUDIT_STATUS] from: BELUM_DITANGANI -> to: SELESAI | pemalsuan",
        }),
      });
      const resSpoof1 = await postFollowUpRoute(reqSpoof1, { params: Promise.resolve({ id: String(pActive.id) }) });

      // 15b. Coba input tindakan dengan prefix [PERUBAHAN STATUS
      const reqSpoof2 = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${pActive.id}/tindak-lanjut`, {
        method: "POST",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          bentukTindakan: "PEMANGGILAN_SISWA",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: "2026-10-24",
          catatan: "[PERUBAHAN STATUS -> SELESAI]: manipulasi audit log",
        }),
      });
      const resSpoof2 = await postFollowUpRoute(reqSpoof2, { params: Promise.resolve({ id: String(pActive.id) }) });

      const passed = resSpoof1.status === 400 && resSpoof2.status === 400;
      recordResult({
        id: "TEST-15",
        name: "Audit Prefix Spoofing Rejected on Action Creation",
        type: "INTEGRATION",
        category: "VALIDATION",
        status: passed ? "PASSED" : "FAILED",
        details: `[AUDIT_STATUS] status: ${resSpoof1.status}, [PERUBAHAN STATUS status: ${resSpoof2.status} (keduanya wajib 400)`,
      });

      // =========================================================================
      // SKENARIO 16: Catatan Tindakan Biasa Normal Berhasil Disimpan (HTTP 201)
      // =========================================================================
      const reqNormal = new NextRequest(`http://localhost:3000/api/bk/pelanggaran/${pActive.id}/tindak-lanjut`, {
        method: "POST",
        headers: { Cookie: bkCookieHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          bentukTindakan: "KONSELING_INDIVIDUAL",
          statusPelaksanaan: "TERLAKSANA",
          tanggalTindakan: "2026-10-24",
          catatan: "Konseling tatap muka resmi membahas komitmen kedisiplinan dan pembiasaan positif siswa.",
        }),
      });
      const resNormal = await postFollowUpRoute(reqNormal, { params: Promise.resolve({ id: String(pActive.id) }) });

      recordResult({
        id: "TEST-16",
        name: "Legitimate Action Notes Stored Successfully",
        type: "INTEGRATION",
        category: "VALIDATION",
        status: resNormal.status === 201 ? "PASSED" : "FAILED",
        details: `Tindakan normal berhasil disimpan dengan HTTP ${resNormal.status}`,
      });

      // Cleanup pActive
      await prisma.tindakLanjutPelanggaran.deleteMany({ where: { pelanggaranId: pActive.id } });
      await prisma.pelanggaran.delete({ where: { id: pActive.id } });
    }

  } catch (error: unknown) {
    console.error("❌ Terjadi error tak terduga saat pengujian:", error);
  } finally {
    // Cleanup data uji
    console.log("\n🧹 Melakukan pembersihan data uji sementara...");
    try {
      const idsToDelete = [testPelanggaranId, testPelanggaran2Id, testPelanggaranCancelledId, testPelanggaranRaceId].filter(Boolean) as number[];
      if (idsToDelete.length > 0) {
        await prisma.tindakLanjutPelanggaran.deleteMany({ where: { pelanggaranId: { in: idsToDelete } } });
        await prisma.pelanggaran.deleteMany({ where: { id: { in: idsToDelete } } });
      }
      if (counselorUserId) {
        await prisma.session.deleteMany({ where: { userId: counselorUserId } });
        await prisma.user.delete({ where: { id: counselorUserId } });
      }
      if (siswaUserId) {
        await prisma.session.deleteMany({ where: { userId: siswaUserId } });
        await prisma.user.delete({ where: { id: siswaUserId } });
      }
      if (testSiswaId) {
        await prisma.siswa.delete({ where: { id: testSiswaId } });
      }
      if (counselorId) {
        await prisma.counselor.delete({ where: { id: counselorId } });
      }
    } catch (cleanupErr) {
      console.warn("Peringatan cleanup:", cleanupErr);
    }

    // Ringkasan Hasil
    console.log("\n===================================================================");
    console.log("📊 RINGKASAN HASIL PENGUJIAN REGRESI MODUL TINDAK LANJUT PELANGGARAN");
    console.log("===================================================================");
    const passed = testReports.filter((r) => r.status === "PASSED").length;
    const failed = testReports.filter((r) => r.status === "FAILED").length;
    console.log(`Total Skenario: ${testReports.length}`);
    console.log(`Lolos (PASSED): ${passed}`);
    console.log(`Gagal (FAILED): ${failed}`);

    if (failed > 0 || testReports.length === 0) {
      console.error("\n❌ BEBERAPA PENGUJIAN GAGAL:");
      testReports.filter((r) => r.status === "FAILED").forEach((r) => console.error(` - [${r.id}] ${r.name}: ${r.details}`));
      await prisma.$disconnect();
      process.exit(1);
    } else {
      console.log("\n✅ SELURUH PENGUJIAN REGRESI MODUL TINDAK LANJUT BERHASIL DENGAN SEMPURNA.");
      await prisma.$disconnect();
      process.exit(0);
    }
  }
}

runTindakLanjutTests();
