import { pelanggaranRepository } from "@/repositories/pelanggaran.repository";
import { studentRepository } from "@/repositories/student.repository";
import { evaluasiSanksiSiswa } from "@/constants/pelanggaran.constant";
import { AppError } from "@/lib/utils/response";

export const pelanggaranService = {
  // 1. Input pelanggaran baru oleh Guru BK (Memicu DSS & increment atomik)
  async recordPelanggaran(
    payload: {
      siswaId: number;
      jenisPelanggaran: string;
      poin: number;
      keterangan?: string | null;
    },
    counselorId?: number | null // Langsung terima counselorId dari auth
  ) {
    // 1. Validasi siswa
    const siswa = await studentRepository.findById(payload.siswaId);
    if (!siswa) {
      throw new AppError(`Siswa dengan ID ${payload.siswaId} tidak ditemukan`, 404);
    }

    const poinSebelumnya = siswa.totalPoin;
    const sanksiSebelumnya = evaluasiSanksiSiswa(poinSebelumnya);

    // 2. Simpan transaksi atomik via repository (hemat 1 query pencarian user)
    const { pelanggaran, updatedSiswa } =
      await pelanggaranRepository.createWithAtomicIncrement({
        siswaId: payload.siswaId,
        counselorId: counselorId ?? null,
        jenisPelanggaran: payload.jenisPelanggaran,
        poin: payload.poin,
        keterangan: payload.keterangan ?? null,
      });

    // 3. Evaluasi ulang DSS menggunakan evaluasiSanksiSiswa[cite: 8]
    const sanksiSekarang = evaluasiSanksiSiswa(updatedSiswa.totalPoin);
    const adaKenaikanLevel = sanksiSebelumnya?.tahap !== sanksiSekarang?.tahap;

    let peringatan: string | null = null;
    if (sanksiSekarang && adaKenaikanLevel) {
      peringatan = `PERHATIAN: Akumulasi poin siswa mencapai ${updatedSiswa.totalPoin}. Status saat ini: ${sanksiSekarang.tahap}.`;
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
        sanksi: sanksiSekarang
          ? {
              tahap: sanksiSekarang.tahap,
              tindakan: sanksiSekarang.tindakan,
              pihakTerlibat: sanksiSekarang.pihakTerlibat,
              statusKritis: sanksiSekarang.statusKritis,
            }
          : {
              tahap: "Disiplin / Aman (< 25 Poin)",
              tindakan: ["Siswa mematuhi tata tertib dengan baik."],
              pihakTerlibat: ["Siswa"],
              statusKritis: false,
            },
        peringatan,
      },
    };
  },

  // 2. Rekap kedisiplinan berpaginasi
  async getRekapPelanggaran(
    page: number = 1,
    limit: number = 10,
    filters?: { rombel?: string; search?: string }
  ) {
    const { items, total, totalPages } =
      await pelanggaranRepository.findAllSiswaWithDisiplin(page, limit, {
        rombel: filters?.rombel,
        search: filters?.search,
      });

    const enrichedItems = items.map((s) => {
      const sanksi = evaluasiSanksiSiswa(s.totalPoin);
      return {
        id: s.id,
        nisn: s.nisn,
        nipd: s.nipd,
        nama: s.nama_siswa,
        rombel: s.rombel,
        totalPoin: s.totalPoin,
        jumlahKasus: s.pelanggaran.length,
        statusSanksi: sanksi?.tahap ?? "Aman (< 25 Poin)",
        statusKritis: sanksi?.statusKritis ?? false,
        tindakan: sanksi?.tindakan ?? [],
        riwayatTerbaru: s.pelanggaran.slice(0, 3).map((p) => ({
          jenis: p.jenisPelanggaran,
          poin: p.poin,
          tanggal: p.createdAt,
          guruBk: p.counselor?.nama_counselor ?? null,
        })),
      };
    });

    return {
      items: enrichedItems,
      total,
      page,
      limit,
      totalPages,
    };
  },

  // 3. Rekap status asesmen siswa per rombel
  // Di dalam method getRekapAssessment pada pelanggaranService:
  async getRekapAssessment(rombel?: string) {
    const students = await pelanggaranRepository.getRekapAssessmentByRombel(rombel);

    let totalMengisiVak = 0;
    let totalMengisiRiasec = 0;
    let totalMengisiAngket = 0;

    const list = students.map((s) => {
      const vak = s.gayaBelajar[0] ?? null;
      const riasec = s.minatBakat[0] ?? null;
      const angket = s.angketMasalah[0] ?? null;

      if (vak) totalMengisiVak++;
      if (riasec) totalMengisiRiasec++;
      if (angket) totalMengisiAngket++;

      let jumlahMasalahDipilih = 0;
      if (angket?.daftarMasalah) {
        try {
          jumlahMasalahDipilih = JSON.parse(angket.daftarMasalah).length;
        } catch {
          jumlahMasalahDipilih = 0;
        }
      }

      return {
        id: s.id,
        nisn: s.nisn,
        nama: s.nama_siswa,
        rombel: s.rombel,
        gayaBelajar: vak
          ? { sudah: true, dominan: vak.dominan, tanggal: vak.createdAt }
          : { sudah: false, dominan: null, tanggal: null },
        minatBakat: riasec
          ? {
              sudah: true,
              top3: riasec.kodeTop3,
              rekomendasi: riasec.rekomendasi,
              tanggal: riasec.createdAt,
            }
          : { sudah: false, top3: null, rekomendasi: null, tanggal: null },
        // Pemetaan status Angket Masalah
        angketMasalah: angket
          ? {
              sudah: true,
              statusReview: angket.statusReview,
              totalDipilih: jumlahMasalahDipilih,
              tanggal: angket.createdAt,
            }
          : { sudah: false, statusReview: null, totalDipilih: 0, tanggal: null },
      };
    });

    return {
      rombel: rombel ?? "SEMUA",
      totalSiswa: students.length,
      statistik: {
        totalMengisiVak,
        totalMengisiRiasec,
        totalMengisiAngket,
      },
      siswa: list,
    };
  }}