import { minatBakatRepository } from "@/repositories/minat-bakat.repository";
import { studentRepository } from "@/repositories/student.repository";
import {
  BANK_SOAL_RIASEC,
  RIASEC_DETAILS,
  RiasecCode,
  matchRekomendasiJurusan,
  REKOMENDASI_JURUSAN,
} from "@/constants/minat-bakat.constant";
import { RiasecAnswerItem } from "@/schemas/minat-bakat.schema";
import { AppError } from "@/lib/utils/response";

export type RiasecScores = Record<RiasecCode, number>;

export function isGrade10(rombel: string | null | undefined): boolean {
  if (!rombel) return false;
  const normalized = rombel.trim().toUpperCase();

  // Jika mengandung indikator kelas 11 atau 12, tolak
  if (
    normalized.startsWith("XI") ||
    normalized.startsWith("XII") ||
    normalized.includes("11") ||
    normalized.includes("12")
  ) {
    return false;
  }

  // Khusus kelas 10
  return normalized.startsWith("X") || normalized.startsWith("10");
}

// Menghitung skor per dimensi dari butir pertanyaan yang dijawab tertarik (interested)
export function calculateRiasecScores(answers: RiasecAnswerItem[]): RiasecScores {
  const scores: RiasecScores = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  const dimensionMap = new Map<number, RiasecCode>();
  for (const q of BANK_SOAL_RIASEC) {
    dimensionMap.set(q.id, q.dimensi);
  }

  for (const item of answers) {
    if (!item.interested) continue;
    const dim = dimensionMap.get(item.questionId);
    if (dim && dim in scores) {
      scores[dim] += 1;
    }
  }

  return scores;
}

export function calculateTop3Riasec(scores: RiasecScores) {
  const ranked = (Object.keys(scores) as RiasecCode[])
    .map((code) => ({ code, score: scores[code] }))
    .sort((a, b) => b.score - a.score);

  const top1 = ranked[0].code;
  const top2 = ranked[1].code;
  const top3 = ranked[2].code;

  return {
    top1,
    top2,
    top3,
    kodeTop3: `${top1}-${top2}-${top3}`,
  };
}

export function buildRadarChart(scores: RiasecScores, totalScore: number) {
  const codes: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];
  const maxScore = Math.max(1, ...Object.values(scores));

  return codes.map((code) => ({
    dimensi: RIASEC_DETAILS[code].namaLengkap,
    kode: code,
    skor: scores[code],
    persentase: totalScore > 0 ? Math.round((scores[code] / totalScore) * 100) : 0,
    skorNormalisasi: Math.round((scores[code] / maxScore) * 100),
  }));
}

export const minatBakatService = {
  getQuestions() {
    return BANK_SOAL_RIASEC;
  },

  // Menerima langsung array jawaban dari schema Zod
  async submitAssessment(siswaId: number, answers: RiasecAnswerItem[]) {
    const student = await studentRepository.findById(siswaId);

    if (!student) {
      throw new AppError("Data profil siswa tidak ditemukan", 404);
    }

    if (!isGrade10(student.rombel)) {
      throw new AppError(
        `Akses ditolak. Asesmen Minat & Bakat (RIASEC) khusus siswa Kelas 10 untuk persiapan pemetaan jurusan Kelas 11 (Rombel Anda: ${student.rombel || "Tidak terdata"}).`,
        403
      );
    }

    const scores = calculateRiasecScores(answers);
    const { R, I, A, S, E, C } = scores;
    const totalScore = R + I + A + S + E + C;
    const { top1, top2, top3, kodeTop3 } = calculateTop3Riasec(scores);
    const rekomendasiDetail = matchRekomendasiJurusan(top1, top2, top3);

    const record = await minatBakatRepository.create({
      siswaId,
      kodeTop3,
      rekomendasi: rekomendasiDetail.kodeJurusan,
      skorR: R,
      skorI: I,
      skorA: A,
      skorS: S,
      skorE: E,
      skorC: C,
    });

    return {
      id: record.id,
      siswaId: record.siswaId,
      kodeTop3,
      rekomendasi: record.rekomendasi,
      rekomendasiDetail,
      skor: { R, I, A, S, E, C, total: totalScore },
      radarChart: buildRadarChart(scores, totalScore),
      top3Details: [RIASEC_DETAILS[top1], RIASEC_DETAILS[top2], RIASEC_DETAILS[top3]],
      createdAt: record.createdAt,
    };
  },

  async getLatestResult(siswaId: number) {
    const record = await minatBakatRepository.findLatestBySiswaId(siswaId);
    if (!record) {
      return null;
    }

    const scores: RiasecScores = {
      R: record.skorR,
      I: record.skorI,
      A: record.skorA,
      S: record.skorS,
      E: record.skorE,
      C: record.skorC,
    };
    const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);

    const parts = record.kodeTop3.split("-") as RiasecCode[];
    const top1 = parts[0] || "I";
    const top2 = parts[1] || "R";
    const top3 = parts[2] || "C";

    const rekomendasiDetail =
      Object.values(REKOMENDASI_JURUSAN).find((j) => j.kodeJurusan === record.rekomendasi) ??
      matchRekomendasiJurusan(top1, top2, top3);

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
      kodeTop3: record.kodeTop3,
      rekomendasi: record.rekomendasi,
      rekomendasiDetail,
      skor: { ...scores, total: totalScore },
      radarChart: buildRadarChart(scores, totalScore),
      top3Details: [
        RIASEC_DETAILS[top1] ?? RIASEC_DETAILS.I,
        RIASEC_DETAILS[top2] ?? RIASEC_DETAILS.R,
        RIASEC_DETAILS[top3] ?? RIASEC_DETAILS.C,
      ],
      createdAt: record.createdAt,
    };
  },
};