import { angketMasalahRepository } from "@/repositories/angket-masalah.repository";
import {
  DAFTAR_MASALAH_ANGKET,
  STATUS_REVIEW_ANGKET,
} from "@/constants/angket-masalah.constant";
import { AppError } from "@/lib/utils/response";

function formatAngketMasalahResult(
  record: NonNullable<Awaited<ReturnType<typeof angketMasalahRepository.findById>>>
) {
  let selectedIds: number[] = [];
  try {
    const parsed = JSON.parse(record.daftarMasalah);
    if (Array.isArray(parsed)) {
      selectedIds = parsed.map(Number).filter((n) => !Number.isNaN(n));
    }
  } catch {
    selectedIds = [];
  }

  // Filter HANYA butir masalah yang dicentang siswa
  const selectedItems = DAFTAR_MASALAH_ANGKET.filter((item) =>
    selectedIds.includes(item.id)
  );

  // Grouping hierarkis: Kategori -> Daftar Subbab -> Butir Jawaban yang dipilih siswa
  const categoryMap = new Map<string, Map<string, { id: number; deskripsi: string }[]>>();

  for (const item of selectedItems) {
    if (!categoryMap.has(item.kategori)) {
      categoryMap.set(item.kategori, new Map());
    }
    const subbabMap = categoryMap.get(item.kategori)!;

    if (!subbabMap.has(item.subbab)) {
      subbabMap.set(item.subbab, []);
    }
    subbabMap.get(item.subbab)!.push({
      id: item.id,
      deskripsi: item.deskripsi,
    });
  }

  const hasilGrouping = Array.from(categoryMap.entries()).map(([kategori, subbabs]) => {
    const daftarSubbab = Array.from(subbabs.entries()).map(([subbab, jawabanDipilih]) => ({
      subbab,
      totalDipilih: jawabanDipilih.length,
      jawabanDipilih,
    }));

    return {
      kategori,
      totalDipilih: daftarSubbab.reduce((acc, curr) => acc + curr.totalDipilih, 0),
      daftarSubbab,
    };
  });

  return {
    id: record.id,
    siswaId: record.siswaId,
    siswa: record.siswa
      ? {
          id: record.siswa.id,
          nipd: record.siswa.nipd,
          nisn: record.siswa.nisn,
          nama: record.siswa.nama_siswa,
          rombel: record.siswa.rombel,
          jenisKelamin: record.siswa.jenis_kelamin,
        }
      : null,
    counselor: record.counselor
      ? {
          id: record.counselor.id,
          nip: record.counselor.nip,
          nama: record.counselor.nama_counselor,
        }
      : null,
    statusReview: record.statusReview,
    catatanGuruBK: record.catatanGuruBK,
    reviewedAt: record.reviewedAt,
    totalMasalahDialami: selectedItems.length,
    hasilangketMasalah: hasilGrouping,
    createdAt: record.createdAt,
  };
}

export const AngketMasalahService = {
  // 1. Tampilan angket / bank soal siswa
  getDaftarPertanyaan() {
    return DAFTAR_MASALAH_ANGKET;
  },

    // 2. Siswa submit asesmen angketMasalah (maksimal 8 ID masalah)
  async submitAssessment(siswaId: number, masalahIds: number[]) {
    const existing = await angketMasalahRepository.findLatestBySiswaId(siswaId);

    if (existing) {
      throw new AppError(
        "Anda sudah pernah mengisi Angket Masalah. Hasil asesmen Anda sudah tersimpan.",
        400
      );
    }

    if (!masalahIds || masalahIds.length === 0) {
      throw new AppError("Pilih minimal 1 butir masalah yang sedang dialami", 400);
    }

    // Sesuaikan batas maksimal dengan 99 butir
    if (masalahIds.length > 99) {
      throw new AppError("Maksimal memilih 99 butir masalah", 400);
    }

    const validIds = masalahIds.filter((id) =>
      DAFTAR_MASALAH_ANGKET.some((item) => item.id === id)
    );

    if (validIds.length === 0) {
      throw new AppError("Pilihan butir masalah tidak valid", 400);
    }

    const record = await angketMasalahRepository.create({
      siswaId,
      daftarMasalah: JSON.stringify(validIds),
      statusReview: STATUS_REVIEW_ANGKET.PENDING,
    });

    return {
      id: record.id,
      statusReview: record.statusReview,
      createdAt: record.createdAt,
    };
  },

  // 3. Detail hasil asesmen angketMasalah berdasarkan ID tes (Grouping: Kategori -> Subbab -> Jawaban)
  async getResultById(id: number) {
    const record = await angketMasalahRepository.findById(id);
    if (!record) {
      throw new AppError("Data Angket Masalah tidak ditemukan", 404);
    }

    return formatAngketMasalahResult(record);
  },

  // 4. Riwayat tes terakhir siswa
  async getLatestResult(siswaId: number) {
    const record = await angketMasalahRepository.findLatestBySiswaId(siswaId);
    if (!record) return null;

    return formatAngketMasalahResult(record);
  },

  // 5. Guru BK meninjau hasil & menyimpan catatan telaah
  async reviewAssessment(
    id: number,
    counselorId: number,
    catatanGuruBK?: string | null
  ) {
    const existing = await angketMasalahRepository.findById(id);
    if (!existing) {
      throw new AppError("Data Angket Masalah tidak ditemukan", 404);
    }

    const updated = await angketMasalahRepository.updateReview(id, {
      statusReview: STATUS_REVIEW_ANGKET.DIREVIEW,
      catatanGuruBK: catatanGuruBK?.trim() || null,
      counselorId,
      reviewedAt: new Date(),
    });

    return {
      id: updated.id,
      siswaId: updated.siswaId,
      statusReview: updated.statusReview,
      catatanGuruBK: updated.catatanGuruBK,
      counselorId: updated.counselorId,
      reviewedAt: updated.reviewedAt,
    };
  },
};