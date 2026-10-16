import { diagnostikRepository } from "@/repositories/diagnostik.repository";
import {
  DAFTAR_MASALAH_DIAGNOSTIK,
  STATUS_REVIEW_DIAGNOSTIK,
} from "@/constants/diagnostik.constant";
import { AppError } from "@/lib/utils/response";

function formatDiagnostikResult(
  record: NonNullable<Awaited<ReturnType<typeof diagnostikRepository.findById>>>
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
  const selectedItems = DAFTAR_MASALAH_DIAGNOSTIK.filter((item) =>
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
    hasilDiagnostik: hasilGrouping,
    createdAt: record.createdAt,
  };
}

export const diagnostikService = {
  // 1. Tampilan angket / bank soal siswa
  getDaftarPertanyaan() {
    return DAFTAR_MASALAH_DIAGNOSTIK;
  },

  // 2. Siswa submit asesmen diagnostik (maksimal 8 ID masalah)
  async submitAssessment(siswaId: number, masalahIds: number[]) {
    if (!Array.isArray(masalahIds) || masalahIds.length === 0) {
      throw new AppError("Pilih minimal 1 butir masalah yang sedang dialami", 400);
    }

    const uniqueIds = Array.from(new Set(masalahIds));

    if (uniqueIds.length > 8) {
      throw new AppError("Maksimal memilih 8 butir masalah", 400);
    }

    const validIdsSet = new Set(DAFTAR_MASALAH_DIAGNOSTIK.map((item) => item.id));
    const hasInvalid = uniqueIds.some((id) => !validIdsSet.has(id));

    if (hasInvalid) {
      throw new AppError("Pilihan butir masalah tidak valid terhadap bank soal", 400);
    }

    const record = await diagnostikRepository.create({
      siswaId,
      daftarMasalah: JSON.stringify(uniqueIds),
      statusReview: STATUS_REVIEW_DIAGNOSTIK.PENDING,
    });

    return {
      id: record.id,
      siswaId: record.siswaId,
      statusReview: record.statusReview,
      totalMasalahDipilih: uniqueIds.length,
      createdAt: record.createdAt,
    };
  },

  // 3. Detail hasil asesmen diagnostik berdasarkan ID tes (Grouping: Kategori -> Subbab -> Jawaban)
  async getResultById(id: number) {
    const record = await diagnostikRepository.findById(id);
    if (!record) {
      throw new AppError("Data tes diagnostik tidak ditemukan", 404);
    }

    return formatDiagnostikResult(record);
  },

  // 4. Riwayat tes terakhir siswa
  async getLatestResult(siswaId: number) {
    const record = await diagnostikRepository.findLatestBySiswaId(siswaId);
    if (!record) return null;

    return formatDiagnostikResult(record);
  },

  // 5. Guru BK meninjau hasil & menyimpan catatan telaah
  async reviewAssessment(
    id: number,
    counselorId: number,
    catatanGuruBK?: string | null
  ) {
    const existing = await diagnostikRepository.findById(id);
    if (!existing) {
      throw new AppError("Data tes diagnostik tidak ditemukan", 404);
    }

    const updated = await diagnostikRepository.updateReview(id, {
      statusReview: STATUS_REVIEW_DIAGNOSTIK.DIREVIEW,
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