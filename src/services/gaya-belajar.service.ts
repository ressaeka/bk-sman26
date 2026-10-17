import { gayaBelajarRepository } from "@/repositories/gaya-belajar.repository";
import {
  GAYA_BELAJAR_DETAILS,
  BANK_SOAL_VAK,
  GayaBelajarMode,
} from "@/constants/gaya-belajar.constant";
import { AppError } from "@/lib/utils/response";

export interface JawabanVakItem {
  questionId: number;
  choice: "A" | "B" | "C"; // A = Visual, B = Auditori, C = Kinestetik
}

export function calculateVakScores(answers: JawabanVakItem[]) {
  let skorV = 0;
  let skorA = 0;
  let skorK = 0;

  for (const item of answers) {
    if (item.choice === "A") skorV += 1;
    else if (item.choice === "B") skorA += 1;
    else if (item.choice === "C") skorK += 1;
  }

  const total = skorV + skorA + skorK;
  return { skorV, skorA, skorK, total };
}

export function determineVakDominant(skorV: number, skorA: number, skorK: number): GayaBelajarMode {
  if (skorV >= skorA && skorV >= skorK) return "VISUAL";
  if (skorA >= skorV && skorA >= skorK) return "AUDITORI";
  return "KINESTETIK";
}

export const gayaBelajarService = {
  // Mengambil 30 butir soal untuk sisi frontend
  getQuestions() {
    return BANK_SOAL_VAK;
  },

  // Menyimpan hasil asesmen siswa
  async submitAssessment(siswaId: number, answers: JawabanVakItem[]) {
    // Cek apakah siswa sudah pernah mengisi tes gaya belajar
    const existing = await gayaBelajarRepository.findLatestBySiswaId(siswaId);
    
    if (existing) {
      throw new AppError(
        "Anda sudah menyelesaikan asesmen Gaya Belajar. Hasil asesmen Anda sudah tercatat.",
        400
      );
    }
    
    if (!answers || answers.length === 0) {
      throw new AppError("Jawaban asesmen tidak boleh kosong", 400);
    }

    const { skorV, skorA, skorK, total } = calculateVakScores(answers);
    const dominan = determineVakDominant(skorV, skorA, skorK);

    // Hitung persentase tiap modalitas
    const persentaseV = total > 0 ? Math.round((skorV / total) * 100) : 0;
    const persentaseA = total > 0 ? Math.round((skorA / total) * 100) : 0;
    const persentaseK = total > 0 ? Math.round((skorK / total) * 100) : 0;

    const record = await gayaBelajarRepository.create({
      siswaId,
      skorV,
      skorA,
      skorK,
      dominan,
    });

    return {
      id: record.id,
      siswaId: record.siswaId,
      skor: { visual: skorV, auditori: skorA, kinestetik: skorK, total },
      persentase: { visual: persentaseV, auditori: persentaseA, kinestetik: persentaseK },
      dominan,
      interpretasi: GAYA_BELAJAR_DETAILS[dominan] ?? GAYA_BELAJAR_DETAILS.VISUAL,
      createdAt: record.createdAt,
    };
  },

  // Mengambil hasil asesmen terakhir milik siswa
  async getLatestResult(siswaId: number) {
    const record = await gayaBelajarRepository.findLatestBySiswaId(siswaId);
    if (!record) {
      return null;
    }

    const total = record.skorV + record.skorA + record.skorK;
    const dominan = record.dominan as GayaBelajarMode;

    return {
      id: record.id,
      siswaId: record.siswaId,
      siswa: record.siswa
        ? {
            id: record.siswa.id,
            nisn: record.siswa.nisn,
            nama: record.siswa.nama_siswa,
            rombel: record.siswa.rombel,
          }
        : undefined,
      skor: {
        visual: record.skorV,
        auditori: record.skorA,
        kinestetik: record.skorK,
        total,
      },
      persentase: {
        visual: total > 0 ? Math.round((record.skorV / total) * 100) : 0,
        auditori: total > 0 ? Math.round((record.skorA / total) * 100) : 0,
        kinestetik: total > 0 ? Math.round((record.skorK / total) * 100) : 0,
      },
      dominan: record.dominan,
      interpretasi: GAYA_BELAJAR_DETAILS[dominan] ?? GAYA_BELAJAR_DETAILS.VISUAL,
      createdAt: record.createdAt,
    };
  },
};