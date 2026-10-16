import { pelanggaranRepository } from "@/repositories/pelanggaran.repository";
import { studentRepository } from "@/repositories/student.repository";
import { userRepository } from "@/repositories/user.repository";
import {
  THRESHOLD_PELANGGARAN,
  STATUS_KEDISIPLINAN,
  STATUS_DISIPLIN_META,
  StatusKedisiplinan,
} from "@/constants/pelanggaran.constant";
import { AppError } from "@/lib/utils/response";

// DSS Engine: Evaluasi tingkat sanksi berdasarkan total akumulasi poin
export function evaluateDisiplin(totalPoin: number) {
  if (totalPoin >= THRESHOLD_PELANGGARAN.DROP_OUT) {
    return {
      status: STATUS_KEDISIPLINAN.DROP_OUT,
      ...STATUS_DISIPLIN_META.DROP_OUT,
      rawanDo: true,
      sanksiAktif: ["SP_1", "PANGGILAN_ORTU", "DROP_OUT"],
    };
  }

  if (totalPoin >= THRESHOLD_PELANGGARAN.PANGGILAN_ORTU) {
    return {
      status: STATUS_KEDISIPLINAN.PANGGILAN_ORTU,
      ...STATUS_DISIPLIN_META.PANGGILAN_ORTU,
      rawanDo: true,
      sanksiAktif: ["SP_1", "PANGGILAN_ORTU"],
    };
  }

  if (totalPoin >= THRESHOLD_PELANGGARAN.SP_1) {
    return {
      status: STATUS_KEDISIPLINAN.SP_1,
      ...STATUS_DISIPLIN_META.SP_1,
      rawanDo: false,
      sanksiAktif: ["SP_1"],
    };
  }

  return {
    status: STATUS_KEDISIPLINAN.AMAN,
    ...STATUS_DISIPLIN_META.AMAN,
    rawanDo: false,
    sanksiAktif: [],
  };
}

export const pelanggaranService = {
  // Input pelanggaran baru oleh Guru BK (otomatis memicu DSS & increment poin di DB)
  async recordPelanggaran(
    payload: {
      siswaId: number;
      jenisPelanggaran: string;
      poin: number;
      keterangan?: string | null;
    },
    counselorUserId?: number
  ) {
    // 1. Validasi siswa
    const siswa = await studentRepository.findById(payload.siswaId);
    if (!siswa) {
      throw new AppError(`Siswa dengan ID ${payload.siswaId} tidak ditemukan`, 404);
    }

    // 2. Ambil counselorId jika ada
    let counselorId: number | null = null;
    if (counselorUserId) {
      const user = await userRepository.findById(counselorUserId);
      counselorId = user?.counselorId ?? null;
    }

    const poinSebelumnya = siswa.totalPoin;
    const statusSebelumnya = evaluateDisiplin(poinSebelumnya).status;

    // 3. Simpan transaksi atomik via repository
    const { pelanggaran, updatedSiswa } = await pelanggaranRepository.createWithAtomicIncrement({
      siswaId: payload.siswaId,
      counselorId,
      jenisPelanggaran: payload.jenisPelanggaran,
      poin: payload.poin,
      keterangan: payload.keterangan ?? null,
    });

    // 4. Evaluasi ulang status DSS setelah penambahan poin
    const evaluasiSekarang = evaluateDisiplin(updatedSiswa.totalPoin);
    const adaKenaikanLevel = statusSebelumnya !== evaluasiSekarang.status;

    let peringatan: string | null = null;
    if (evaluasiSekarang.status === STATUS_KEDISIPLINAN.DROP_OUT) {
      peringatan = "PERINGATAN: Siswa mencapai batas Drop Out (>= 100 poin). Segera jadwalkan sidang pleno dewan guru.";
    } else if (evaluasiSekarang.status === STATUS_KEDISIPLINAN.PANGGILAN_ORTU && adaKenaikanLevel) {
      peringatan = "PERINGATAN: Siswa mencapai batas Panggilan Orang Tua (>= 75 poin). Terbitkan surat pemanggilan resmi.";
    } else if (evaluasiSekarang.status === STATUS_KEDISIPLINAN.SP_1 && adaKenaikanLevel) {
      peringatan = "PERINGATAN: Siswa mencapai batas SP-1 (>= 50 poin). Terbitkan surat peringatan 1.";
    }

    return {
      pelanggaran: {
        id: pelanggaran.id,
        jenisPelanggaran: pelanggaran.jenisPelanggaran,
        poin: pelanggaran.poin,
        keterangan: pelanggaran.keterangan,
        createdAt: pelanggaran.createdAt,
        guruBk: pelanggaran.counselor?.nama_counselor ?? null,
      },
      siswa: {
        id: updatedSiswa.id,
        nisn: updatedSiswa.nisn,
        nama: updatedSiswa.nama_siswa,
        rombel: updatedSiswa.rombel,
        totalPoin: updatedSiswa.totalPoin,
      },
      dss: {
        poinSebelumnya,
        poinDitambahkan: payload.poin,
        totalPoinSekarang: updatedSiswa.totalPoin,
        statusSebelumnya,
        statusSekarang: evaluasiSekarang.status,
        label: evaluasiSekarang.label,
        tindakan: evaluasiSekarang.tindakan,
        rawanDo: evaluasiSekarang.rawanDo,
        peringatan,
      },
    };
  },

  // Rekap kedisiplinan berpaginasi (mendukung filter rombel & pencarian)
  async getRekapPelanggaran(
    page: number = 1,
    limit: number = 10,
    filters?: { rombel?: string; search?: string; status?: StatusKedisiplinan }
  ) {
    const { items, total, totalPages } = await pelanggaranRepository.findAllSiswaWithDisiplin(
      page,
      limit,
      { rombel: filters?.rombel, search: filters?.search }
    );

    // Tempelkan hasil analisis DSS pada setiap siswa
    const enrichedItems = items.map((s) => {
      const dss = evaluateDisiplin(s.totalPoin);
      return {
        id: s.id,
        nisn: s.nisn,
        nipd: s.nipd,
        nama: s.nama_siswa,
        rombel: s.rombel,
        totalPoin: s.totalPoin,
        jumlahKasus: s.pelanggaran.length,
        statusDisiplin: dss.status,
        labelDisiplin: dss.label,
        tindakanBK: dss.tindakan,
        rawanDo: dss.rawanDo,
        riwayatTerbaru: s.pelanggaran.slice(0, 3).map((p) => ({
          jenis: p.jenisPelanggaran,
          poin: p.poin,
          tanggal: p.createdAt,
          guruBk: p.counselor?.nama_counselor ?? null,
        })),
      };
    });

    // Filter opsional jika user memilih filter status tertentu
    const finalItems = filters?.status
      ? enrichedItems.filter((i) => i.statusDisiplin === filters.status)
      : enrichedItems;

    return {
      items: finalItems,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // Rekap hasil asesmen siswa per rombel
  async getRekapAssessment(rombel?: string) {
    const students = await pelanggaranRepository.getRekapAssessmentByRombel(rombel);

    let totalMengisiVak = 0;
    let totalMengisiRiasec = 0;

    const list = students.map((s) => {
      const vak = s.gayaBelajar[0] ?? null;
      const riasec = s.minatBakat[0] ?? null;

      if (vak) totalMengisiVak++;
      if (riasec) totalMengisiRiasec++;

      return {
        id: s.id,
        nisn: s.nisn,
        nama: s.nama_siswa,
        rombel: s.rombel,
        gayaBelajar: vak
          ? { sudah: true, dominan: vak.dominan, tanggal: vak.createdAt }
          : { sudah: false, dominan: null, tanggal: null },
        minatBakat: riasec
          ? { sudah: true, top3: riasec.kodeTop3, rekomendasi: riasec.rekomendasi, tanggal: riasec.createdAt }
          : { sudah: false, top3: null, rekomendasi: null, tanggal: null },
      };
    });

    return {
      rombel: rombel ?? "SEMUA",
      totalSiswa: students.length,
      statistik: {
        totalMengisiVak,
        totalMengisiRiasec,
      },
      siswa: list,
    };
  },
};