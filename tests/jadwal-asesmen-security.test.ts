import { prisma } from "../src/lib/prisma";
import { jadwalAsesmenService } from "../src/services/jadwal-asesmen.service";
import { TIPE_ASESMEN, STATUS_AKSES_JADWAL } from "../src/constants/jadwal-asesmen.constant";
import { AppError } from "../src/lib/utils/response";

interface TestReport {
  id: string;
  name: string;
  category: "SCHEDULE" | "SECURITY" | "INTEGRITY";
  status: "PASSED" | "FAILED";
  details: string;
}

const testReports: TestReport[] = [];

function recordResult(report: TestReport) {
  testReports.push(report);
  const icon = report.status === "PASSED" ? "✅ [PASSED]" : "❌ [FAILED]";
  console.log(`${icon} [${report.category}] ${report.name} -> ${report.details}`);
}

async function runJadwalAsesmenSecurityTests() {
  console.log("===============================================================");
  console.log("🚀 MEMULAI PENGUJIAN AKSES 3 ASSESSMENT BERDASARKAN JADWAL BK");
  console.log("===============================================================");

  const timestamp = Date.now();
  const nisnA = `998${String(timestamp).slice(-7)}1`;
  const nisnB = `998${String(timestamp).slice(-7)}2`;

  let siswaA: { id: number; rombel: string | null } | undefined;
  let siswaB: { id: number; rombel: string | null } | undefined;
  let counselor: { id: number } | undefined;

  const createdScheduleIds: number[] = [];

  try {
    // 0. Setup counselor dan dua siswa uji
    counselor = await prisma.counselor.create({
      data: {
        nama_counselor: `Guru BK Test Jadwal ${timestamp}`,
        nip: `1980${String(timestamp).slice(-14)}`,
      },
    });

    siswaA = await prisma.siswa.create({
      data: {
        nisn: nisnA,
        nama_siswa: `Siswa Kelas X-1 ${timestamp}`,
        rombel: "X-1",
        totalPoin: 0,
      },
    });

    siswaB = await prisma.siswa.create({
      data: {
        nisn: nisnB,
        nama_siswa: `Siswa Kelas XII-IPA-1 ${timestamp}`,
        rombel: "XII-IPA-1",
        totalPoin: 0,
      },
    });

    // -------------------------------------------------------------------------
    // TEST 1: KETIGA ASESMEN TERKUNCI JIKA BELUM ADA JADWAL DARI GURU BK
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 1: Pengujian ketiga asesmen terkunci jika belum ada jadwal...");
    const statusesNoSchedule = await jadwalAsesmenService.getAllStudentAssessmentStatuses(
      siswaA.id,
      siswaA.rombel
    );

    const allWaiting = statusesNoSchedule.every(
      (s) => s.status === STATUS_AKSES_JADWAL.MENUNGGU_JADWAL && s.canAccess === false
    );

    if (allWaiting && statusesNoSchedule.length === 3) {
      recordResult({
        id: "JADWAL-01",
        name: "Asesmen Terkunci Saat Belum Ada Jadwal",
        category: "SCHEDULE",
        status: "PASSED",
        details: "Ketiga asesmen berstatus 'Menunggu Jadwal BK' dan canAccess bernilai false.",
      });
    } else {
      recordResult({
        id: "JADWAL-01",
        name: "Asesmen Terkunci Saat Belum Ada Jadwal",
        category: "SCHEDULE",
        status: "FAILED",
        details: "Status awal bukan MENUNGGU_JADWAL atau tombol masih aktif.",
      });
    }

    // -------------------------------------------------------------------------
    // TEST 2: ASESMEN TERKUNCI SEBELUM WAKTU MULAI (TERJADWAL)
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 2: Pengujian asesmen dengan jadwal masa depan (TERJADWAL)...");
    const futureStart = new Date(Date.now() + 2 * 3600 * 1000); // 2 jam ke depan
    const futureEnd = new Date(Date.now() + 4 * 3600 * 1000); // 4 jam ke depan

    const schedTerjadwal = await jadwalAsesmenService.createSchedule(counselor.id, {
      tipe: TIPE_ASESMEN.ANGKET_MASALAH,
      judul: "AUM Kelas X Semester Ganjil",
      tanggalMulai: futureStart,
      tanggalSelesai: futureEnd,
      targetTingkat: "10",
      targetRombel: null, // Semua rombel kelas 10
      isActive: true,
    });
    createdScheduleIds.push(schedTerjadwal.id);

    const statusTerjadwal = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.ANGKET_MASALAH
    );

    if (
      statusTerjadwal.status === STATUS_AKSES_JADWAL.TERJADWAL &&
      statusTerjadwal.canAccess === false &&
      statusTerjadwal.formattedWaktu !== null
    ) {
      recordResult({
        id: "JADWAL-02",
        name: "Asesmen Berstatus Terjadwal Sebelum Waktu Mulai",
        category: "SCHEDULE",
        status: "PASSED",
        details: `Berstatus 'Terjadwal' (${statusTerjadwal.formattedWaktu}) dan pengerjaan tetap terkunci.`,
      });
    } else {
      recordResult({
        id: "JADWAL-02",
        name: "Asesmen Berstatus Terjadwal Sebelum Waktu Mulai",
        category: "SCHEDULE",
        status: "FAILED",
        details: `Status yang didapat: ${statusTerjadwal.status}, canAccess: ${statusTerjadwal.canAccess}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 3: ASESMEN DAPAT DIAKSES SELAMA JADWAL AKTIF (SEDANG_BERLANGSUNG)
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 3: Pengujian asesmen yang jadwalnya aktif (SEDANG_BERLANGSUNG)...");
    const activeStart = new Date(Date.now() - 30 * 60 * 1000); // 30 menit yang lalu
    const activeEnd = new Date(Date.now() + 90 * 60 * 1000); // 90 menit lagi

    const schedAktif = await jadwalAsesmenService.createSchedule(counselor.id, {
      tipe: TIPE_ASESMEN.GAYA_BELAJAR,
      judul: "Asesmen Gaya Belajar Siswa Baru",
      tanggalMulai: activeStart,
      tanggalSelesai: activeEnd,
      targetTingkat: "ALL",
      targetRombel: null,
      isActive: true,
    });
    createdScheduleIds.push(schedAktif.id);

    const statusAktif = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.GAYA_BELAJAR
    );

    if (
      statusAktif.status === STATUS_AKSES_JADWAL.SEDANG_BERLANGSUNG &&
      statusAktif.canAccess === true
    ) {
      recordResult({
        id: "JADWAL-03",
        name: "Akses Dibuka Saat Jadwal Sedang Berlangsung",
        category: "SCHEDULE",
        status: "PASSED",
        details: "Asesmen berstatus 'Sedang Berlangsung' dan canAccess bernilai true.",
      });
    } else {
      recordResult({
        id: "JADWAL-03",
        name: "Akses Dibuka Saat Jadwal Sedang Berlangsung",
        category: "SCHEDULE",
        status: "FAILED",
        details: `Status: ${statusAktif.status}, canAccess: ${statusAktif.canAccess}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 4: AKSES DITOLAK SETELAH JADWAL BERAKHIR
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 4: Pengujian asesmen dengan jadwal masa lalu (JADWAL_BERAKHIR)...");
    const pastStart = new Date(Date.now() - 3 * 3600 * 1000); // 3 jam lalu
    const pastEnd = new Date(Date.now() - 1 * 3600 * 1000); // 1 jam lalu

    const schedBerakhir = await jadwalAsesmenService.createSchedule(counselor.id, {
      tipe: TIPE_ASESMEN.MINAT_BAKAT,
      judul: "Pemetaan Minat Karir",
      tanggalMulai: pastStart,
      tanggalSelesai: pastEnd,
      targetTingkat: "10",
      targetRombel: null,
      isActive: true,
    });
    createdScheduleIds.push(schedBerakhir.id);

    const statusBerakhir = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.MINAT_BAKAT
    );

    if (
      statusBerakhir.status === STATUS_AKSES_JADWAL.JADWAL_BERAKHIR &&
      statusBerakhir.canAccess === false
    ) {
      recordResult({
        id: "JADWAL-04",
        name: "Akses Ditolak Setelah Jadwal Berakhir",
        category: "SCHEDULE",
        status: "PASSED",
        details: "Asesmen berstatus 'Jadwal Berakhir' dan canAccess bernilai false.",
      });
    } else {
      recordResult({
        id: "JADWAL-04",
        name: "Akses Ditolak Setelah Jadwal Berakhir",
        category: "SCHEDULE",
        status: "FAILED",
        details: `Status: ${statusBerakhir.status}, canAccess: ${statusBerakhir.canAccess}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 5: KEAMANAN SERVER: SISWA TIDAK DAPAT MELEWATI ATURAN VIA URL/API LANGSUNG
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 5: Pengujian assertStudentCanWorkOnAssessment di server...");
    let rejectedWaiting = false;
    let rejectedUpcoming = false;
    let rejectedExpired = false;

    // A. Coba akses ANGKET_MASALAH (masih TERJADWAL)
    try {
      await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
        siswaA.id,
        siswaA.rombel,
        TIPE_ASESMEN.ANGKET_MASALAH
      );
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 403) {
        rejectedUpcoming = true;
      }
    }

    // B. Coba akses MINAT_BAKAT (sudah JADWAL_BERAKHIR)
    try {
      await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
        siswaA.id,
        siswaA.rombel,
        TIPE_ASESMEN.MINAT_BAKAT
      );
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 403) {
        rejectedExpired = true;
      }
    }

    // C. Nonaktifkan jadwal GAYA_BELAJAR untuk tes MENUNGGU_JADWAL
    await jadwalAsesmenService.updateSchedule(schedAktif.id, { isActive: false });
    try {
      await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
        siswaA.id,
        siswaA.rombel,
        TIPE_ASESMEN.GAYA_BELAJAR
      );
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 403) {
        rejectedWaiting = true;
      }
    }
    // Pulihkan keaktifan
    await jadwalAsesmenService.updateSchedule(schedAktif.id, { isActive: true });

    if (rejectedWaiting && rejectedUpcoming && rejectedExpired) {
      recordResult({
        id: "SECURITY-01",
        name: "Proteksi Server Melempar 403 Terhadap Akses Ilegal",
        category: "SECURITY",
        status: "PASSED",
        details: "Server secara konsisten menolak request API (HTTP 403) saat jadwal menunggu, belum mulai, atau berakhir.",
      });
    } else {
      recordResult({
        id: "SECURITY-01",
        name: "Proteksi Server Melempar 403 Terhadap Akses Ilegal",
        category: "SECURITY",
        status: "FAILED",
        details: `rejectedWaiting: ${rejectedWaiting}, rejectedUpcoming: ${rejectedUpcoming}, rejectedExpired: ${rejectedExpired}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 6: ISOLASI CAKUPAN JADWAL (TARGET ROMBEL DAN TINGKAT KELAS)
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 6: Pengujian isolasi cakupan jadwal antar-rombel dan antar-tingkat...");
    // Jadwal spesifik hanya untuk rombel "X-1"
    const schedKhususX1 = await jadwalAsesmenService.createSchedule(counselor.id, {
      tipe: TIPE_ASESMEN.ANGKET_MASALAH,
      judul: "AUM Khusus Rombel X-1",
      tanggalMulai: activeStart,
      tanggalSelesai: activeEnd,
      targetTingkat: "10",
      targetRombel: "X-1",
      isActive: true,
    });
    createdScheduleIds.push(schedKhususX1.id);

    // Siswa A (X-1) -> Berhak akses (SEDANG_BERLANGSUNG)
    const statusSiswaA = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.ANGKET_MASALAH
    );

    // Siswa B (XII-IPA-1) -> Tidak berhak akses (MENUNGGU_JADWAL karena jadwal tidak cocok)
    const statusSiswaB = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaB.id,
      siswaB.rombel,
      TIPE_ASESMEN.ANGKET_MASALAH
    );

    if (
      statusSiswaA.status === STATUS_AKSES_JADWAL.SEDANG_BERLANGSUNG &&
      statusSiswaA.canAccess === true &&
      statusSiswaB.status === STATUS_AKSES_JADWAL.MENUNGGU_JADWAL &&
      statusSiswaB.canAccess === false
    ) {
      recordResult({
        id: "SECURITY-02",
        name: "Isolasi Cakupan Jadwal Berdasarkan Rombel/Tingkat",
        category: "SECURITY",
        status: "PASSED",
        details: "Siswa rombel X-1 dapat mengakses jadwal, sedangkan siswa kelas XII-IPA-1 ditolak (Menunggu Jadwal BK).",
      });
    } else {
      recordResult({
        id: "SECURITY-02",
        name: "Isolasi Cakupan Jadwal Berdasarkan Rombel/Tingkat",
        category: "SECURITY",
        status: "FAILED",
        details: `Siswa A: ${statusSiswaA.status}, Siswa B: ${statusSiswaB.status}`,
      });
    }

    // -------------------------------------------------------------------------
    // TEST 7: JAWABAN YANG SUDAH TERSIMPAN TIDAK TERHAPUS KETIKA JADWAL BERAKHIR
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 7: Pengujian persistensi data siswa saat jadwal berakhir...");
    // Simulasikan siswa A telah menyelesaikan Angket Masalah
    const angketTersimpan = await prisma.angketMasalah.create({
      data: {
        siswaId: siswaA.id,
        daftarMasalah: JSON.stringify([1, 2, 3]),
        statusReview: "PENDING",
      },
    });

    // Kadaluarsakan semua jadwal
    await prisma.jadwalAsesmen.updateMany({
      where: { tipe: TIPE_ASESMEN.ANGKET_MASALAH },
      data: {
        tanggalMulai: pastStart,
        tanggalSelesai: pastEnd,
      },
    });

    const statusAfterExpire = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.ANGKET_MASALAH
    );

    const recordDbMasihAda = await prisma.angketMasalah.findUnique({
      where: { id: angketTersimpan.id },
    });

    if (
      statusAfterExpire.status === STATUS_AKSES_JADWAL.SUDAH_SELESAI &&
      statusAfterExpire.isCompleted === true &&
      recordDbMasihAda !== null
    ) {
      recordResult({
        id: "INTEGRITY-01",
        name: "Persistensi Data Hasil Asesmen",
        category: "INTEGRITY",
        status: "PASSED",
        details: "Jawaban tersimpan di database tetap utuh dan status menampilkan 'Selesai Dikerjakan'.",
      });
    } else {
      recordResult({
        id: "INTEGRITY-01",
        name: "Persistensi Data Hasil Asesmen",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Status: ${statusAfterExpire.status}, Record DB: ${Boolean(recordDbMasihAda)}`,
      });
    }

    // Bersihkan angket uji
    await prisma.angketMasalah.delete({ where: { id: angketTersimpan.id } });

    // -------------------------------------------------------------------------
    // TEST 8: PERUBAHAN JADWAL DARI GURU BK TERCERMIN SECARA REAL-TIME
    // -------------------------------------------------------------------------
    console.log("\n🧪 UJI 8: Pengujian perubahan jadwal BK seketika mengubah status akses siswa...");
    // Ubah jadwal GAYA_BELAJAR menjadi tanggal lampau
    await jadwalAsesmenService.updateSchedule(schedAktif.id, {
      tanggalMulai: pastStart,
      tanggalSelesai: pastEnd,
    });

    const statusAfterUpdate = await jadwalAsesmenService.getStudentAssessmentStatus(
      siswaA.id,
      siswaA.rombel,
      TIPE_ASESMEN.GAYA_BELAJAR
    );

    if (
      statusAfterUpdate.status === STATUS_AKSES_JADWAL.JADWAL_BERAKHIR &&
      statusAfterUpdate.canAccess === false
    ) {
      recordResult({
        id: "INTEGRITY-02",
        name: "Perubahan Jadwal BK Tercermin Real-Time",
        category: "INTEGRITY",
        status: "PASSED",
        details: "Pembaruan waktu oleh Guru BK seketika mengunci akses siswa tanpa latency data statis.",
      });
    } else {
      recordResult({
        id: "INTEGRITY-02",
        name: "Perubahan Jadwal BK Tercermin Real-Time",
        category: "INTEGRITY",
        status: "FAILED",
        details: `Status yang didapat: ${statusAfterUpdate.status}`,
      });
    }

  } catch (error) {
    console.error("❌ Terjadi kesalahan fatal pada test runner:", error);
  } finally {
    console.log("\n🧹 Membersihkan fixture pengujian jadwal...");
    try {
      if (createdScheduleIds.length > 0) {
        await prisma.jadwalAsesmen.deleteMany({
          where: { id: { in: createdScheduleIds } },
        });
      }
      if (siswaA?.id) {
        await prisma.siswa.delete({ where: { id: siswaA.id } });
      }
      if (siswaB?.id) {
        await prisma.siswa.delete({ where: { id: siswaB.id } });
      }
      if (counselor?.id) {
        await prisma.counselor.delete({ where: { id: counselor.id } });
      }
      console.log("✨ Fixture pengujian jadwal berhasil dibersihkan.");
    } catch (cleanupErr) {
      console.error("Pembersihan fixture gagal:", cleanupErr);
    }

    await prisma.$disconnect();
  }

  console.log("\n===============================================================");
  console.log("📊 RINGKASAN HASIL TEST JADWAL ASESMEN & KEAMANAN");
  console.log("===============================================================");
  const passed = testReports.filter((r) => r.status === "PASSED").length;
  const failed = testReports.filter((r) => r.status === "FAILED").length;
  console.log(`Total Pengujian: ${testReports.length}`);
  console.log(`Lolos (Passed) : ${passed}`);
  console.log(`Gagal (Failed) : ${failed}`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

void runJadwalAsesmenSecurityTests();
