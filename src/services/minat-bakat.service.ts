import { minatBakatRepository } from "@/repositories/minat-bakat.repository";
import { studentRepository } from "@/repositories/student.repository";
import {
  BANK_SOAL_RIASEC,
  RIASEC_DETAILS,
  RIASEC_CODES,
  hitungRekomendasiJurusan,
} from "@/constants/minat-bakat.constant";
import type { RiasecCode } from "@/constants/minat-bakat.constant";
import type { RiasecAnswerItem } from "@/schemas/minat-bakat.schema";
import { AppError } from "@/lib/utils/response";

export type RiasecScores = Record<RiasecCode, number>;

const REKOMENDASI_SEPARATOR = " / ";

const QUESTION_DIMENSIONS = new Map<number, RiasecCode>(
  BANK_SOAL_RIASEC.map((question) => [
    question.id,
    question.dimensi,
  ]),
);

const VALID_QUESTION_IDS = new Set(
  BANK_SOAL_RIASEC.map((question) => question.id),
);

/**
 * Hanya siswa kelas 10 yang dapat mengikuti asesmen.
 *
 * Contoh yang diterima:
 * X, X-1, X IPA 1, 10, 10-1, 10 IPA 1.
 *
 * Contoh yang ditolak:
 * XI, XII, 11, 12, XI-1, XII IPA 1.
 */
export function isGrade10(
  rombel: string | null | undefined,
): boolean {
  if (!rombel) return false;

  const normalized = rombel.trim().toUpperCase();

  const match = normalized.match(
    /^(XII|XI|X|12|11|10)(?![A-Z])/,
  );

  return match !== null &&
    (match[1] === "X" || match[1] === "10");
}

/**
 * Memastikan seluruh soal dijawab tepat satu kali.
 */
function validateAnswers(
  answers: RiasecAnswerItem[],
): void {
  if (!Array.isArray(answers)) {
    throw new AppError("Format jawaban tidak valid.", 400);
  }

  if (answers.length !== BANK_SOAL_RIASEC.length) {
    throw new AppError(
      `Semua ${BANK_SOAL_RIASEC.length} soal harus dijawab.`,
      400,
    );
  }

  const answeredIds = new Set<number>();

  for (const item of answers) {
    if (
      !Number.isInteger(item.questionId) ||
      !VALID_QUESTION_IDS.has(item.questionId)
    ) {
      throw new AppError(
        `ID soal tidak valid: ${item.questionId}.`,
        400,
      );
    }

    if (typeof item.interested !== "boolean") {
      throw new AppError(
        `Jawaban soal ${item.questionId} tidak valid.`,
        400,
      );
    }

    if (answeredIds.has(item.questionId)) {
      throw new AppError(
        `Soal ${item.questionId} dijawab lebih dari satu kali.`,
        400,
      );
    }

    answeredIds.add(item.questionId);
  }
}

/**
 * Menghitung skor berdasarkan jawaban yang diminati.
 * interested = true menghasilkan satu poin untuk dimensinya.
 */
export function calculateRiasecScores(
  answers: RiasecAnswerItem[],
): RiasecScores {
  validateAnswers(answers);

  const scores: RiasecScores = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };

  for (const item of answers) {
    if (!item.interested) continue;

    const dimension = QUESTION_DIMENSIONS.get(item.questionId);

    if (dimension) {
      scores[dimension] += 1;
    }
  }

  return scores;
}

/**
 * Mengurutkan skor dari terbesar ke terkecil.
 * Jika skor seri, urutan mengikuti R, I, A, S, E, C.
 */
export function calculateTop3Riasec(
  scores: RiasecScores,
) {
  const ranked = RIASEC_CODES
    .map((code, index) => ({
      code,
      score: scores[code],
      index,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.index - b.index,
    );

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

/**
 * Menyiapkan data untuk radar chart.
 */
export function buildRadarChart(
  scores: RiasecScores,
  totalScore: number,
) {
  const maxScore = Math.max(
    1,
    ...Object.values(scores),
  );

  return RIASEC_CODES.map((code) => ({
    dimensi: RIASEC_DETAILS[code].namaLengkap,
    kode: code,
    skor: scores[code],
    persentase:
      totalScore > 0
        ? Math.round(
            (scores[code] / totalScore) * 100,
          )
        : 0,
    skorNormalisasi: Math.round(
      (scores[code] / maxScore) * 100,
    ),
  }));
}

/**
 * Menghitung total skor dari keenam dimensi.
 */
function calculateTotalScore(
  scores: RiasecScores,
): number {
  return RIASEC_CODES.reduce(
    (total, code) => total + scores[code],
    0,
  );
}

/**
 * Menghitung hasil DSS dari skor keenam dimensi.
 * Fungsi ini harus mengikuti aturan penjurusan pada constant.
 */
function calculateDssResult(
  scores: RiasecScores,
) {
  return hitungRekomendasiJurusan(scores);
}

/**
 * Mengubah beberapa rekomendasi menjadi satu nilai string
 * agar sesuai dengan kolom rekomendasi pada repository saat ini.
 */
function serializeRecommendations(
  codes: string[],
): string {
  return codes.join(REKOMENDASI_SEPARATOR);
}

export const minatBakatService = {
  getQuestions() {
    return BANK_SOAL_RIASEC;
  },

  async submitAssessment(
    siswaId: number,
    answers: RiasecAnswerItem[],
  ) {
    const student = await studentRepository.findById(siswaId);

    if (!student) {
      throw new AppError(
        "Data profil siswa tidak ditemukan.",
        404,
      );
    }

    if (!isGrade10(student.rombel)) {
      throw new AppError(
        `Akses ditolak. Asesmen Minat & Bakat RIASEC khusus siswa kelas 10 untuk persiapan pemetaan jurusan kelas 11 (rombel Anda: ${student.rombel || "Tidak terdata"}).`,
        403,
      );
    }

    validateAnswers(answers);

    // Cegah pengisian asesmen lebih dari satu kali.
    const existing =
      await minatBakatRepository.findLatestBySiswaId(siswaId);

    if (existing) {
      throw new AppError(
        "Anda sudah menyelesaikan asesmen Minat & Bakat RIASEC. Rekomendasi jurusan Anda sudah terbit.",
        400,
      );
    }

    const scores = calculateRiasecScores(answers);
    const totalScore = calculateTotalScore(scores);

    if (totalScore === 0) {
      throw new AppError(
        "Pilih minimal satu butir kegiatan yang Anda minati.",
        400,
      );
    }

    // Top 3 hanya untuk profil minat siswa.
    const {
      top1,
      top2,
      top3,
      kodeTop3,
    } = calculateTop3Riasec(scores);

    // DSS menentukan rekomendasi berdasarkan aturan RIA vs SEC.
    const hasil = calculateDssResult(scores);

    if (
      !hasil.rekomendasiUtama ||
      hasil.rekomendasiUtama.length === 0
    ) {
      throw new AppError(
        "Rekomendasi jurusan tidak berhasil ditentukan.",
        500,
      );
    }

    const rekomendasiKode = serializeRecommendations(
      hasil.rekomendasiUtama.map(
        (jurusan) => jurusan.kodeJurusan,
      ),
    );

    const record = await minatBakatRepository.create({
      siswaId,
      kodeTop3,
      rekomendasi: rekomendasiKode,
      skorR: scores.R,
      skorI: scores.I,
      skorA: scores.A,
      skorS: scores.S,
      skorE: scores.E,
      skorC: scores.C,
    });

    return {
      id: record.id,
      siswaId: record.siswaId,
      kodeTop3,
      rekomendasi: record.rekomendasi,
      rekomendasiUtama: hasil.rekomendasiUtama,
      alasan: hasil.alasan,
      totalRIA: hasil.totalRIA,
      totalSEC: hasil.totalSEC,
      skor: {
        ...scores,
        total: totalScore,
      },
      radarChart: buildRadarChart(scores, totalScore),
      top3Details: [
        RIASEC_DETAILS[top1],
        RIASEC_DETAILS[top2],
        RIASEC_DETAILS[top3],
      ],
      createdAt: record.createdAt,
    };
  },

  async getLatestResult(siswaId: number) {
    const record =
      await minatBakatRepository.findLatestBySiswaId(siswaId);

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

    const totalScore = calculateTotalScore(scores);

    // Hitung ulang Top 3 berdasarkan skor tersimpan.
    const {
      top1,
      top2,
      top3,
      kodeTop3,
    } = calculateTop3Riasec(scores);

    // Hitung ulang rekomendasi dari skor, bukan dari string database.
    const hasil = calculateDssResult(scores);

    const rekomendasiKode = serializeRecommendations(
      hasil.rekomendasiUtama.map(
        (jurusan) => jurusan.kodeJurusan,
      ),
    );

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
      kodeTop3,
      rekomendasi: rekomendasiKode,
      rekomendasiUtama: hasil.rekomendasiUtama,
      alasan: hasil.alasan,
      totalRIA: hasil.totalRIA,
      totalSEC: hasil.totalSEC,
      skor: {
        ...scores,
        total: totalScore,
      },
      radarChart: buildRadarChart(scores, totalScore),
      top3Details: [
        RIASEC_DETAILS[top1],
        RIASEC_DETAILS[top2],
        RIASEC_DETAILS[top3],
      ],
      createdAt: record.createdAt,
    };
  },
};