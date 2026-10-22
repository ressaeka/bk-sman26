import { prisma } from "@/lib/prisma";
import {
  jadwalAsesmenRepository,
  CreateJadwalInput,
  UpdateJadwalInput,
} from "@/repositories/jadwal-asesmen.repository";
import {
  TipeAsesmen,
  StatusAksesJadwal,
  STATUS_AKSES_JADWAL,
  LABEL_ASESMEN,
  DESKRIPSI_ASESMEN,
  URL_ASESMEN,
} from "@/constants/jadwal-asesmen.constant";
import { AppError } from "@/lib/utils/response";

export interface StudentScheduleStatus {
  tipe: TipeAsesmen;
  nama: string;
  deskripsi: string;
  url: string;
  status: StatusAksesJadwal;
  statusLabel: string;
  canAccess: boolean;
  isCompleted: boolean;
  jadwalId: number | null;
  judulJadwal: string | null;
  tanggalMulai: string | null; // ISO String
  tanggalSelesai: string | null; // ISO String
  formattedWaktu: string | null; // e.g. "24 Okt 2026, 08:00 - 10:00 WIB"
  pesan: string;
}

/**
 * Normalisasi tingkat kelas dari rombel (e.g. "X-1" -> "10", "XI-IPA-1" -> "11", "XII-IPS-2" -> "12")
 */
export function extractGradeLevel(rombel: string | null | undefined): string | null {
  if (!rombel) return null;
  const normalized = rombel.trim().toUpperCase();
  const match = normalized.match(/^(XII|XI|X|12|11|10)(?![A-Z])/);
  if (!match) return null;

  const raw = match[1];
  if (raw === "X" || raw === "10") return "10";
  if (raw === "XI" || raw === "11") return "11";
  if (raw === "XII" || raw === "12") return "12";
  return null;
}

/**
 * Mengecek apakah jadwal sesuai dengan rombel / tingkat siswa.
 */
export function isScheduleMatchingStudent(
  schedule: { targetTingkat?: string | null; targetRombel?: string | null },
  studentRombel: string | null | undefined
): boolean {
  // Jika ada target rombel spesifik (misal: "X-1")
  if (schedule.targetRombel && schedule.targetRombel.trim() !== "") {
    if (!studentRombel) return false;
    return schedule.targetRombel.trim().toUpperCase() === studentRombel.trim().toUpperCase();
  }

  // Jika ada target tingkat kelas (misal: "10" atau "X" atau "ALL")
  if (
    schedule.targetTingkat &&
    schedule.targetTingkat.trim() !== "" &&
    schedule.targetTingkat.trim().toUpperCase() !== "ALL"
  ) {
    const studentGrade = extractGradeLevel(studentRombel);
    const targetGrade = extractGradeLevel(schedule.targetTingkat) || schedule.targetTingkat.trim().toUpperCase();

    if (!studentGrade || studentGrade !== targetGrade) {
      return false;
    }
  }

  // Jika targetTingkat ALL atau null, berlaku untuk semua siswa
  return true;
}

/**
 * Format tanggal & jam ke format WIB (Asia/Jakarta)
 */
export function formatScheduleWib(start: Date, end: Date): string {
  try {
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const startDateStr = new Intl.DateTimeFormat("id-ID", dateOptions).format(start);
    const endDateStr = new Intl.DateTimeFormat("id-ID", dateOptions).format(end);

    const startTimeStr = new Intl.DateTimeFormat("id-ID", timeOptions).format(start);
    const endTimeStr = new Intl.DateTimeFormat("id-ID", timeOptions).format(end);

    if (startDateStr === endDateStr) {
      return `${startDateStr}, ${startTimeStr} - ${endTimeStr} WIB`;
    }
    return `${startDateStr} ${startTimeStr} - ${endDateStr} ${endTimeStr} WIB`;
  } catch {
    return `${start.toISOString()} - ${end.toISOString()}`;
  }
}

export const jadwalAsesmenService = {
  /**
   * Cek apakah siswa sudah menyelesaikan asesmen tertentu
   */
  async checkCompletionStatus(siswaId: number, tipe: TipeAsesmen): Promise<boolean> {
    if (tipe === "ANGKET_MASALAH") {
      const existing = await prisma.angketMasalah.findFirst({
        where: { siswaId },
        select: { id: true },
      });
      return Boolean(existing);
    }

    if (tipe === "GAYA_BELAJAR") {
      const existing = await prisma.gayaBelajar.findFirst({
        where: { siswaId },
        select: { id: true },
      });
      return Boolean(existing);
    }

    if (tipe === "MINAT_BAKAT") {
      const existing = await prisma.minatBakat.findFirst({
        where: { siswaId },
        select: { id: true },
      });
      return Boolean(existing);
    }

    return false;
  },

  /**
   * Menghitung status akses siswa untuk suatu tipe asesmen berdasarkan jadwal
   */
  async getStudentAssessmentStatus(
    siswaId: number,
    studentRombel: string | null | undefined,
    tipe: TipeAsesmen,
    serverNow: Date = new Date()
  ): Promise<StudentScheduleStatus> {
    const nama = LABEL_ASESMEN[tipe];
    const deskripsi = DESKRIPSI_ASESMEN[tipe];
    const url = URL_ASESMEN[tipe];

    // 1. Cek apakah sudah pernah menyelesaikan asesmen
    const isCompleted = await this.checkCompletionStatus(siswaId, tipe);
    if (isCompleted) {
      return {
        tipe,
        nama,
        deskripsi,
        url,
        status: STATUS_AKSES_JADWAL.SUDAH_SELESAI,
        statusLabel: "Selesai Dikerjakan",
        canAccess: false,
        isCompleted: true,
        jadwalId: null,
        judulJadwal: null,
        tanggalMulai: null,
        tanggalSelesai: null,
        formattedWaktu: null,
        pesan: "Kamu telah menyelesaikan asesmen ini. Hasil asesmen telah tersimpan di sistem.",
      };
    }

    // 2. Ambil jadwal aktif yang cocok untuk siswa ini
    const activeSchedules = await jadwalAsesmenRepository.findActiveByTipe(tipe);
    const matchingSchedules = activeSchedules.filter((sched) =>
      isScheduleMatchingStudent(sched, studentRombel)
    );

    if (matchingSchedules.length === 0) {
      return {
        tipe,
        nama,
        deskripsi,
        url,
        status: STATUS_AKSES_JADWAL.MENUNGGU_JADWAL,
        statusLabel: "Menunggu Jadwal BK",
        canAccess: false,
        isCompleted: false,
        jadwalId: null,
        judulJadwal: null,
        tanggalMulai: null,
        tanggalSelesai: null,
        formattedWaktu: null,
        pesan: "Guru BK belum mengagendakan jadwal pelaksanaan asesmen ini untuk kelasmu.",
      };
    }

    const nowMs = serverNow.getTime();

    // Prioritas 1: Jadwal yang SEDANG BERLANGSUNG
    const ongoing = matchingSchedules.find(
      (s) => s.tanggalMulai.getTime() <= nowMs && nowMs <= s.tanggalSelesai.getTime()
    );

    if (ongoing) {
      return {
        tipe,
        nama,
        deskripsi,
        url,
        status: STATUS_AKSES_JADWAL.SEDANG_BERLANGSUNG,
        statusLabel: "Sedang Berlangsung",
        canAccess: true,
        isCompleted: false,
        jadwalId: ongoing.id,
        judulJadwal: ongoing.judul,
        tanggalMulai: ongoing.tanggalMulai.toISOString(),
        tanggalSelesai: ongoing.tanggalSelesai.toISOString(),
        formattedWaktu: formatScheduleWib(ongoing.tanggalMulai, ongoing.tanggalSelesai),
        pesan: `Jadwal aktif hingga ${formatScheduleWib(ongoing.tanggalMulai, ongoing.tanggalSelesai).split("-")[1]?.trim() || "waktu selesai"}. Silakan kerjakan sebelum waktu berakhir.`,
      };
    }

    // Prioritas 2: Jadwal TERJADWAL (akan datang)
    const upcomingSchedules = matchingSchedules
      .filter((s) => s.tanggalMulai.getTime() > nowMs)
      .sort((a, b) => a.tanggalMulai.getTime() - b.tanggalMulai.getTime());

    if (upcomingSchedules.length > 0) {
      const nextSched = upcomingSchedules[0];
      return {
        tipe,
        nama,
        deskripsi,
        url,
        status: STATUS_AKSES_JADWAL.TERJADWAL,
        statusLabel: "Terjadwal",
        canAccess: false,
        isCompleted: false,
        jadwalId: nextSched.id,
        judulJadwal: nextSched.judul,
        tanggalMulai: nextSched.tanggalMulai.toISOString(),
        tanggalSelesai: nextSched.tanggalSelesai.toISOString(),
        formattedWaktu: formatScheduleWib(nextSched.tanggalMulai, nextSched.tanggalSelesai),
        pesan: `Asesmen dijadwalkan pada ${formatScheduleWib(nextSched.tanggalMulai, nextSched.tanggalSelesai)}. Pengerjaan akan terbuka otomatis pada waktu mulai.`,
      };
    }

    // Prioritas 3: Jadwal BERAKHIR (semua jadwal lampau)
    const pastSchedules = matchingSchedules
      .filter((s) => s.tanggalSelesai.getTime() < nowMs)
      .sort((a, b) => b.tanggalSelesai.getTime() - a.tanggalSelesai.getTime());

    const lastExpired = pastSchedules[0];
    return {
      tipe,
      nama,
      deskripsi,
      url,
      status: STATUS_AKSES_JADWAL.JADWAL_BERAKHIR,
      statusLabel: "Jadwal Berakhir",
      canAccess: false,
      isCompleted: false,
      jadwalId: lastExpired?.id ?? null,
      judulJadwal: lastExpired?.judul ?? null,
      tanggalMulai: lastExpired?.tanggalMulai.toISOString() ?? null,
      tanggalSelesai: lastExpired?.tanggalSelesai.toISOString() ?? null,
      formattedWaktu: lastExpired ? formatScheduleWib(lastExpired.tanggalMulai, lastExpired.tanggalSelesai) : null,
      pesan: "Waktu pelaksanaan asesmen telah berakhir. Hubungi Guru BK jika kamu membutuhkan jadwal susulan.",
    };
  },

  /**
   * Mengambil status ketiga asesmen sekaligus untuk dashboard siswa
   */
  async getAllStudentAssessmentStatuses(
    siswaId: number,
    studentRombel: string | null | undefined,
    serverNow: Date = new Date()
  ): Promise<StudentScheduleStatus[]> {
    const [angket, gaya, minat] = await Promise.all([
      this.getStudentAssessmentStatus(siswaId, studentRombel, "ANGKET_MASALAH", serverNow),
      this.getStudentAssessmentStatus(siswaId, studentRombel, "GAYA_BELAJAR", serverNow),
      this.getStudentAssessmentStatus(siswaId, studentRombel, "MINAT_BAKAT", serverNow),
    ]);

    return [angket, gaya, minat];
  },

  /**
   * Validasi ketat akses pengerjaan asesmen di server/API:
   * Melempar AppError 403 jika siswa tidak berhak mengakses saat ini.
   */
  async assertStudentCanWorkOnAssessment(
    siswaId: number,
    studentRombel: string | null | undefined,
    tipe: TipeAsesmen,
    serverNow: Date = new Date()
  ): Promise<StudentScheduleStatus> {
    const status = await this.getStudentAssessmentStatus(
      siswaId,
      studentRombel,
      tipe,
      serverNow
    );

    if (status.status === STATUS_AKSES_JADWAL.SUDAH_SELESAI) {
      throw new AppError(
        `Anda sudah menyelesaikan ${status.nama}. Pengerjaan ulang tidak diperbolehkan.`,
        400
      );
    }

    if (status.status === STATUS_AKSES_JADWAL.MENUNGGU_JADWAL) {
      throw new AppError(
        `Akses ditolak. Belum ada jadwal resmi dari Guru BK untuk ${status.nama} pada kelas Anda (${studentRombel || "Tidak terdata"}).`,
        403
      );
    }

    if (status.status === STATUS_AKSES_JADWAL.TERJADWAL) {
      throw new AppError(
        `Akses ditolak. ${status.nama} masih terkunci hingga waktu mulai: ${status.formattedWaktu}.`,
        403
      );
    }

    if (status.status === STATUS_AKSES_JADWAL.JADWAL_BERAKHIR) {
      throw new AppError(
        `Akses ditolak. Jadwal pelaksanaan ${status.nama} telah berakhir pada ${status.formattedWaktu}.`,
        403
      );
    }

    if (!status.canAccess) {
      throw new AppError(
        `Akses ditolak. Saat ini Anda tidak diizinkan membuka atau mengerjakan ${status.nama}.`,
        403
      );
    }

    return status;
  },

  // -------------------------------------------------------------
  // FITUR KELOLA JADWAL UNTUK GURU BK
  // -------------------------------------------------------------

  async listSchedules(filters?: {
    tipe?: TipeAsesmen;
    targetTingkat?: string;
    targetRombel?: string;
    isActive?: boolean;
  }) {
    return jadwalAsesmenRepository.findAll(filters);
  },

  async getScheduleById(id: number) {
    const schedule = await jadwalAsesmenRepository.findById(id);
    if (!schedule) {
      throw new AppError("Jadwal asesmen tidak ditemukan", 404);
    }
    return schedule;
  },

  async createSchedule(counselorId: number, data: CreateJadwalInput) {
    if (new Date(data.tanggalSelesai) <= new Date(data.tanggalMulai)) {
      throw new AppError("Waktu selesai harus lebih besar dari waktu mulai", 400);
    }

    return jadwalAsesmenRepository.create({
      ...data,
      counselorId,
    });
  },

  async updateSchedule(id: number, data: UpdateJadwalInput) {
    const existing = await jadwalAsesmenRepository.findById(id);
    if (!existing) {
      throw new AppError("Jadwal asesmen tidak ditemukan", 404);
    }

    const mulai = data.tanggalMulai ? new Date(data.tanggalMulai) : existing.tanggalMulai;
    const selesai = data.tanggalSelesai ? new Date(data.tanggalSelesai) : existing.tanggalSelesai;

    if (selesai <= mulai) {
      throw new AppError("Waktu selesai harus lebih besar dari waktu mulai", 400);
    }

    return jadwalAsesmenRepository.update(id, data);
  },

  async deleteSchedule(id: number) {
    const existing = await jadwalAsesmenRepository.findById(id);
    if (!existing) {
      throw new AppError("Jadwal asesmen tidak ditemukan", 404);
    }
    return jadwalAsesmenRepository.delete(id);
  },
};
