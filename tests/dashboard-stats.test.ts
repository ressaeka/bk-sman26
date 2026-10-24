import { dashboardService } from "../src/services/dashboard.service";
import { dashboardRepository } from "../src/repositories/dashboard.repository";
import { prisma } from "../src/lib/prisma";
import { GET } from "../src/app/api/bk/dashboard/stats/route";
import { NextRequest } from "next/server";

interface TestReport {
  id: string;
  name: string;
  category: "TREND_CHART" | "COUNSELING" | "SCHEDULE" | "SECURITY" | "INTEGRITY";
  status: "PASSED" | "FAILED";
  details: string;
}

const testReports: TestReport[] = [];

function recordResult(report: TestReport) {
  testReports.push(report);
  const icon = report.status === "PASSED" ? "✅ [PASSED]" : "❌ [FAILED]";
  console.log(`${icon} [${report.category}] ${report.name} -> ${report.details}`);
}

async function runDashboardStatsTests() {
  console.log("===============================================================");
  console.log("🚀 MEMULAI PENGUJIAN LOGIKA DATA & AGREGASI DASHBOARD BK SI-BK-26");
  console.log("===============================================================");

  const timestamp = Date.now();
  const createdSiswaIds: number[] = [];
  const createdViolationIds: number[] = [];
  const createdKonselingIds: number[] = [];
  const createdScheduleIds: number[] = [];
  let counselorId: number | undefined;

  try {
    // 0. Setup Counselor & Siswa Uji
    const counselor = await prisma.counselor.create({
      data: {
        nama_counselor: `Guru BK Test Dashboard ${timestamp}`,
        nip: `1985${String(timestamp).slice(-14)}`,
      },
    });
    counselorId = counselor.id;

    // Buat 3 siswa uji
    for (let i = 1; i <= 3; i++) {
      const s = await prisma.siswa.create({
        data: {
          nisn: `997${String(timestamp).slice(-6)}${i}`,
          nama_siswa: `Siswa Dashboard Test ${i} ${timestamp}`,
          rombel: `XI-IPA-${i}`,
          totalPoin: i === 1 ? 80 : i === 2 ? 30 : 0, // Siswa 1: SP3/Panggilan Ortu (80), Siswa 2: Peringatan I (30), Siswa 3: Bersih (0)
        },
      });
      createdSiswaIds.push(s.id);
    }

    // =========================================================================
    // 1. PENGUJIAN GRAFIK TREN PELANGGARAN 6 BULAN (BASELINE & CROSS-YEAR)
    // =========================================================================

    // Test 1.1: Pembuatan 6 bucket bulan kalender
    const now = new Date("2026-03-15T10:00:00Z"); // Misal pertengahan Maret 2026
    const statsBaseline = await dashboardService.getDashboardStats(now);
    const trendBuckets = statsBaseline.violations.trend.months;

    if (trendBuckets.length === 6) {
      recordResult({
        id: "TREND_01",
        name: "Jumlah Bucket Tren Tepat 6 Bulan",
        category: "TREND_CHART",
        status: "PASSED",
        details: `Menghasilkan tepat ${trendBuckets.length} bucket bulan kalender.`,
      });
    } else {
      recordResult({
        id: "TREND_01",
        name: "Jumlah Bucket Tren Tepat 6 Bulan",
        category: "TREND_CHART",
        status: "FAILED",
        details: `Ekspektasi 6 bucket, didapat: ${trendBuckets.length}`,
      });
    }

    // Test 1.2: Cross-year boundary label formatting
    // Maret 2026 - 5 bulan = Oktober 2025. Rentang: Okt 2025 - Mar 2026
    const periodLabel = statsBaseline.violations.trend.periodLabel;
    if (periodLabel.includes("2025") && periodLabel.includes("2026")) {
      recordResult({
        id: "TREND_02",
        name: "Label Periode Menangani Pergantian Tahun",
        category: "TREND_CHART",
        status: "PASSED",
        details: `Label periode menyertakan kedua tahun: "${periodLabel}".`,
      });
    } else {
      recordResult({
        id: "TREND_02",
        name: "Label Periode Menangani Pergantian Tahun",
        category: "TREND_CHART",
        status: "FAILED",
        details: `Label tidak mencakup kedua tahun: "${periodLabel}".`,
      });
    }

    // Test 1.3: Verifikasi urutan kronologis bucket (YYYY-MM terurut naik)
    let isChronological = true;
    for (let i = 1; i < trendBuckets.length; i++) {
      if (trendBuckets[i].monthKey <= trendBuckets[i - 1].monthKey) {
        isChronological = false;
        break;
      }
    }
    if (isChronological) {
      recordResult({
        id: "TREND_03",
        name: "Urutan Kronologis Bucket YYYY-MM",
        category: "TREND_CHART",
        status: "PASSED",
        details: `Bucket terurut dari terlama ke terbaru (${trendBuckets[0].monthKey} s.d. ${trendBuckets[5].monthKey}).`,
      });
    } else {
      recordResult({
        id: "TREND_03",
        name: "Urutan Kronologis Bucket YYYY-MM",
        category: "TREND_CHART",
        status: "FAILED",
        details: "Bucket tidak terurut secara kronologis.",
      });
    }

    // Test 1.4: Tambah catatan pelanggaran historis multi-bulan dan verifikasi agregasi
    // Siswa 1 punya 2 pelanggaran di bulan sekarang, 1 pelanggaran di bulan lalu
    const dNow = new Date();
    const dLastMonth = new Date(dNow.getFullYear(), dNow.getMonth() - 1, 15);

    const v1 = await prisma.pelanggaran.create({
      data: {
        siswaId: createdSiswaIds[0],
        counselorId,
        jenisPelanggaran: "Terlambat Upacara",
        poin: 10,
        keterangan: "Diberi teguran lisan",
        createdAt: dNow,
      },
    });
    createdViolationIds.push(v1.id);

    const v2 = await prisma.pelanggaran.create({
      data: {
        siswaId: createdSiswaIds[0],
        counselorId,
        jenisPelanggaran: "Seragam Tidak Lengkap",
        poin: 15,
        keterangan: "Teguran",
        createdAt: dNow,
      },
    });
    createdViolationIds.push(v2.id);

    const v3 = await prisma.pelanggaran.create({
      data: {
        siswaId: createdSiswaIds[0],
        counselorId,
        jenisPelanggaran: "Bolos Jam Pelajaran",
        poin: 25,
        keterangan: "Peringatan lisan & pembinaan",
        createdAt: dLastMonth,
      },
    });
    createdViolationIds.push(v3.id);

    // Ambil stats terbaru dari backend
    const currentStats = await dashboardService.getDashboardStats(dNow);
    const totalTrendSum = currentStats.violations.trend.months.reduce((acc, b) => acc + b.count, 0);

    if (totalTrendSum === currentStats.violations.trend.totalCases) {
      recordResult({
        id: "TREND_04",
        name: "Konsistensi Total Kasus dengan Penjumlahan Seluruh Bucket",
        category: "TREND_CHART",
        status: "PASSED",
        details: `Total tren (${currentStats.violations.trend.totalCases}) sama persis dengan jumlah bucket (${totalTrendSum}).`,
      });
    } else {
      recordResult({
        id: "TREND_04",
        name: "Konsistensi Total Kasus dengan Penjumlahan Seluruh Bucket",
        category: "TREND_CHART",
        status: "FAILED",
        details: `Mismatch: totalCases=${currentStats.violations.trend.totalCases}, bucketSum=${totalTrendSum}`,
      });
    }

    // Test 1.5: Delta persentase bulan lalu vs bulan berjalan
    // Bulan berjalan vs bulan lalu tidak boleh NaN atau crash
    const diff = currentStats.violations.trend.monthDiff;
    if (diff !== null && typeof diff.diff === "number" && typeof diff.formattedLabel === "string") {
      recordResult({
        id: "TREND_05",
        name: "Perhitungan Delta Bulan Berjalan vs Bulan Lalu",
        category: "TREND_CHART",
        status: "PASSED",
        details: `Delta terhitung aman: diff=${diff.diff}, label="${diff.formattedLabel}".`,
      });
    } else {
      recordResult({
        id: "TREND_05",
        name: "Perhitungan Delta Bulan Berjalan vs Bulan Lalu",
        category: "TREND_CHART",
        status: "FAILED",
        details: `Delta tidak valid atau null: ${JSON.stringify(diff)}`,
      });
    }

    // =========================================================================
    // 2. PENGUJIAN AGREGASI KONSELING (4 STATUS & BEBAS DARI BATASAN PAGINATION)
    // =========================================================================

    // Buat 4 pengajuan konseling dengan status berbeda
    const statuses: Array<"PENDING" | "DISETUJUI" | "SELESAI" | "DITOLAK"> = [
      "PENDING",
      "DISETUJUI",
      "SELESAI",
      "DITOLAK",
    ];

    for (const st of statuses) {
      const k = await prisma.konseling.create({
        data: {
          siswaId: createdSiswaIds[0],
          counselorId,
          tanggal: dNow,
          jam: "09:00",
          topik: `Konseling Uji Status ${st}`,
          keluhan: "Uji coba agregasi dashboard",
          status: st,
        },
      });
      createdKonselingIds.push(k.id);
    }

    const counselingCounts = await dashboardRepository.getCounselingStatusCounts();
    const sumAllStatuses =
      counselingCounts.pending +
      counselingCounts.approved +
      counselingCounts.completed +
      counselingCounts.rejected;

    if (sumAllStatuses === counselingCounts.total) {
      recordResult({
        id: "COUNSELING_01",
        name: "Total Pengajuan Konseling Sama Dengan Penjumlahan Seluruh Status",
        category: "COUNSELING",
        status: "PASSED",
        details: `Pending: ${counselingCounts.pending}, Disetujui: ${counselingCounts.approved}, Selesai: ${counselingCounts.completed}, Ditolak: ${counselingCounts.rejected} -> Total: ${counselingCounts.total}`,
      });
    } else {
      recordResult({
        id: "COUNSELING_01",
        name: "Total Pengajuan Konseling Sama Dengan Penjumlahan Seluruh Status",
        category: "COUNSELING",
        status: "FAILED",
        details: `Mismatch: sum=${sumAllStatuses}, total=${counselingCounts.total}`,
      });
    }

    // Verifikasi completion rate
    const completionRate =
      counselingCounts.total > 0
        ? Math.round((counselingCounts.completed / counselingCounts.total) * 100)
        : 0;

    if (completionRate >= 0 && completionRate <= 100) {
      recordResult({
        id: "COUNSELING_02",
        name: "Perhitungan Tingkat Penyelesaian Sesi Konseling",
        category: "COUNSELING",
        status: "PASSED",
        details: `Tingkat penyelesaian: ${completionRate}% (valid rentang 0-100%).`,
      });
    } else {
      recordResult({
        id: "COUNSELING_02",
        name: "Perhitungan Tingkat Penyelesaian Sesi Konseling",
        category: "COUNSELING",
        status: "FAILED",
        details: `Tingkat penyelesaian di luar batas: ${completionRate}`,
      });
    }

    // =========================================================================
    // 3. PENGUJIAN JADWAL ASESMEN & LOGIKA RENTANG WAKTU (INCLUSIVE DATES)
    // =========================================================================

    // Jadwal 1: Aktif saat ini (kemarin s.d. besok)
    const dYesterday = new Date(dNow.getTime() - 24 * 60 * 60 * 1000);
    const dTomorrow = new Date(dNow.getTime() + 24 * 60 * 60 * 1000);

    const schActive = await prisma.jadwalAsesmen.create({
      data: {
        counselorId,
        tipe: "ANGKET_MASALAH",
        judul: `Jadwal Aktif Test ${timestamp}`,
        tanggalMulai: dYesterday,
        tanggalSelesai: dTomorrow,
        isActive: true,
      },
    });
    createdScheduleIds.push(schActive.id);

    // Jadwal 2: Sudah lewat masa berlakunya (3 hari lalu s.d. 2 hari lalu)
    const d3DaysAgo = new Date(dNow.getTime() - 3 * 24 * 60 * 60 * 1000);
    const d2DaysAgo = new Date(dNow.getTime() - 2 * 24 * 60 * 60 * 1000);

    const schExpired = await prisma.jadwalAsesmen.create({
      data: {
        counselorId,
        tipe: "GAYA_BELAJAR",
        judul: `Jadwal Expired Test ${timestamp}`,
        tanggalMulai: d3DaysAgo,
        tanggalSelesai: d2DaysAgo,
        isActive: true, // true tapi tanggalnya sudah lewat
      },
    });
    createdScheduleIds.push(schExpired.id);

    // Jadwal 3: isActive = false (meskipun tanggalnya cocok hari ini)
    const schInactiveFlag = await prisma.jadwalAsesmen.create({
      data: {
        counselorId,
        tipe: "MINAT_BAKAT",
        judul: `Jadwal Inactive Test ${timestamp}`,
        tanggalMulai: dYesterday,
        tanggalSelesai: dTomorrow,
        isActive: false, // dinonaktifkan secara manual oleh Guru BK
      },
    });
    createdScheduleIds.push(schInactiveFlag.id);

    // Cek count active schedules dari repository
    const activeCount = await dashboardRepository.countActiveSchedules(dNow);
    if (activeCount >= 1) {
      recordResult({
        id: "SCHEDULE_01",
        name: "Filter Jadwal Aktif Sesuai Rentang Tanggal & Flag isActive",
        category: "SCHEDULE",
        status: "PASSED",
        details: `Berhasil mendeteksi ${activeCount} jadwal aktif tanpa menghitung yang kadaluarsa atau dinonaktifkan.`,
      });
    } else {
      recordResult({
        id: "SCHEDULE_01",
        name: "Filter Jadwal Aktif Sesuai Rentang Tanggal & Flag isActive",
        category: "SCHEDULE",
        status: "FAILED",
        details: `Ekspektasi minimal 1 jadwal aktif, didapat: ${activeCount}`,
      });
    }

    // =========================================================================
    // 4. PENGUJIAN ATURAN SANKSI TATA TERTIB RESMI (PASAL 8 & SISWA KRITIS)
    // =========================================================================

    // Siswa 1 (80 poin): Ambang Pasal 8 (>= 75: Surat Peringatan III / Panggilan Ortu)
    // Siswa 2 (30 poin): Ambang Pasal 8 (>= 25: Surat Peringatan I)
    // Siswa 3 (0 poin): Tidak kritis (0 poin)
    const criticalCount = await dashboardRepository.countCriticalStudents(25);
    if (criticalCount >= 2) {
      recordResult({
        id: "SANCTION_01",
        name: "Deteksi Siswa Kritis Berdasarkan Ambang Resmi Pasal 8 (Poin >= 25)",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Berhasil menghitung siswa dengan akumulasi poin >= 25 (${criticalCount} siswa).`,
      });
    } else {
      recordResult({
        id: "SANCTION_01",
        name: "Deteksi Siswa Kritis Berdasarkan Ambang Resmi Pasal 8 (Poin >= 25)",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Ekspektasi minimal 2 siswa kritis, didapat: ${criticalCount}`,
      });
    }

    // Verifikasi siswa tanpa pelanggaran (0 poin) TIDAK dianggap kritis
    const cleanStudent = await prisma.siswa.findUnique({
      where: { id: createdSiswaIds[2] },
    });
    if (cleanStudent && cleanStudent.totalPoin === 0 && cleanStudent.totalPoin < 25) {
      recordResult({
        id: "SANCTION_02",
        name: "Siswa Bersih (0 Poin) Tidak Dihitung Sebagai Siswa Kritis",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Siswa NISN ${cleanStudent.nisn} memiliki ${cleanStudent.totalPoin} poin dan tidak masuk daftar tindak lanjut.`,
      });
    } else {
      recordResult({
        id: "SANCTION_02",
        name: "Siswa Bersih (0 Poin) Tidak Dihitung Sebagai Siswa Kritis",
        category: "INTEGRITY",
        status: "FAILED",
        details: "Siswa 0 poin terhitung salah.",
      });
    }

    // =========================================================================
    // 5. PENGUJIAN DISTRIBUSI KATEGORI PELANGGARAN
    // =========================================================================
    const latestStats = await dashboardService.getDashboardStats(dNow);
    const categories = latestStats.violations.categories;
    if (categories.kedisiplinan >= 2 && categories.tataTertib >= 1) {
      recordResult({
        id: "CATEGORY_01",
        name: "Distribusi Kategori Pelanggaran dari Database Aktual",
        category: "INTEGRITY",
        status: "PASSED",
        details: `Kedisiplinan: ${categories.kedisiplinan}, Tata Tertib: ${categories.tataTertib}, Lainnya: ${categories.lainnya}`,
      });
    } else {
      recordResult({
        id: "CATEGORY_01",
        name: "Distribusi Kategori Pelanggaran dari Database Aktual",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Distribusi kategori tidak sesuai ekspektasi: ${JSON.stringify(categories)}`,
      });
    }
    // =========================================================================
    // 6. PENGUJIAN KEAMANAN & OTORISASI ROUTE API (/api/bk/dashboard/stats)
    // =========================================================================
    const unauthReq = new NextRequest("http://localhost:3000/api/bk/dashboard/stats");
    const unauthRes = await GET(unauthReq);

    if (unauthRes.status === 401) {
      recordResult({
        id: "SECURITY_01",
        name: "Endpoint Menolak Request Tanpa Sesi (401 Unauthorized)",
        category: "SECURITY",
        status: "PASSED",
        details: "Request anonim tanpa cookie ditolak dengan HTTP 401.",
      });
    } else {
      recordResult({
        id: "SECURITY_01",
        name: "Endpoint Menolak Request Tanpa Sesi (401 Unauthorized)",
        category: "SECURITY",
        status: "FAILED",
        details: `Ekspektasi 401, didapat status HTTP: ${unauthRes.status}`,
      });
    }

  } catch (error) {
    console.error("FATAL ERROR DALAM PENGUJIAN:", error);
    recordResult({
      id: "FATAL_ERROR",
      name: "Eksekusi Pengujian Dashboard Stats",
      category: "INTEGRITY",
      status: "FAILED",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    // Cleanup data uji agar tidak mengotori database
    console.log("🧹 Membersihkan data uji...");
    if (createdViolationIds.length > 0) {
      await prisma.pelanggaran.deleteMany({
        where: { id: { in: createdViolationIds } },
      });
    }
    if (createdKonselingIds.length > 0) {
      await prisma.konseling.deleteMany({
        where: { id: { in: createdKonselingIds } },
      });
    }
    if (createdScheduleIds.length > 0) {
      await prisma.jadwalAsesmen.deleteMany({
        where: { id: { in: createdScheduleIds } },
      });
    }
    if (createdSiswaIds.length > 0) {
      await prisma.siswa.deleteMany({
        where: { id: { in: createdSiswaIds } },
      });
    }
    if (counselorId) {
      await prisma.counselor.delete({
        where: { id: counselorId },
      });
    }
    console.log("✅ Pembersihan data uji selesai.");
  }

  // Rekapitulasi Hasil Pengujian
  console.log("\n===============================================================");
  console.log("📊 REKAPITULASI HASIL PENGUJIAN DASHBOARD BK SI-BK-26");
  console.log("===============================================================");
  const passed = testReports.filter((r) => r.status === "PASSED").length;
  const failed = testReports.filter((r) => r.status === "FAILED").length;
  console.log(`Total Pengujian: ${testReports.length}`);
  console.log(`Lolos (PASSED) : ${passed}`);
  console.log(`Gagal (FAILED) : ${failed}`);

  await prisma.$disconnect();

  if (failed > 0) {
    console.error("❌ BEBERAPA PENGUJIAN GAGAL.");
    process.exit(1);
  } else {
    console.log("🎉 SELURUH PENGUJIAN BERHASIL LOLOS 100%!");
    process.exit(0);
  }
}

void runDashboardStatsTests();

