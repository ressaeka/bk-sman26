import { pelanggaranRepository } from "@/repositories/pelanggaran.repository";
import { studentRepository } from "@/repositories/student.repository";
import {
  evaluasiSanksiSiswa,
  StatusTindakLanjutKasus,
  BentukTindakLanjut,
  STATUS_TINDAK_LANJUT_META,
  BENTUK_TINDAK_LANJUT_LABEL,
} from "@/constants/pelanggaran.constant";
import {
  CreateTindakLanjutInput,
  UpdateStatusKasusInput,
} from "@/schemas/pelanggaran.schema";
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
        statusTindakLanjut: pelanggaran.statusTindakLanjut,
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
        riwayatTerbaru: s.pelanggaran.slice(0, 3).map((p) => {
          const meta =
            STATUS_TINDAK_LANJUT_META[p.statusTindakLanjut as StatusTindakLanjutKasus] ?? {
              label: p.statusTindakLanjut,
              badgeVariant: "neutral" as const,
            };
          return {
            id: p.id,
            jenis: p.jenisPelanggaran,
            poin: p.poin,
            keterangan: p.keterangan,
            statusTindakLanjut: p.statusTindakLanjut,
            statusLabel: meta.label,
            badgeVariant: meta.badgeVariant,
            totalTindakan: p._count.tindakLanjut,
            tanggal: p.createdAt,
            guruBk: p.counselor?.nama_counselor ?? null,
          };
        }),
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

  // 2b. Mengambil daftar log pelanggaran individual dengan filter status, rombel, dan pencarian
  async getAllPelanggaran(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status?: StatusTindakLanjutKasus;
      rombel?: string;
      search?: string;
    }
  ) {
    const { items, total, totalPages } = await pelanggaranRepository.findAllPelanggaran(
      page,
      limit,
      filters
    );

    const enrichedItems = items.map((item) => {
      const meta =
        STATUS_TINDAK_LANJUT_META[item.statusTindakLanjut as StatusTindakLanjutKasus] ?? {
          label: item.statusTindakLanjut,
          badgeVariant: "neutral" as const,
        };

      const latestAction = item.tindakLanjut[0] ?? null;

      return {
        id: item.id,
        jenisPelanggaran: item.jenisPelanggaran,
        poin: item.poin,
        keterangan: item.keterangan,
        statusTindakLanjut: item.statusTindakLanjut,
        statusLabel: meta.label,
        badgeVariant: meta.badgeVariant,
        createdAt: item.createdAt,
        totalTindakan: item._count.tindakLanjut,
        counselor: item.counselor ? { id: item.counselor.id, nama: item.counselor.nama_counselor } : null,
        siswa: {
          id: item.siswa.id,
          nisn: item.siswa.nisn,
          nama: item.siswa.nama_siswa,
          rombel: item.siswa.rombel,
          totalPoin: item.siswa.totalPoin,
          sanksi: evaluasiSanksiSiswa(item.siswa.totalPoin),
        },
        tindakanTerakhir: latestAction
          ? {
              id: latestAction.id,
              bentukTindakan: latestAction.bentukTindakan,
              bentukLabel:
                BENTUK_TINDAK_LANJUT_LABEL[latestAction.bentukTindakan as BentukTindakLanjut] ??
                latestAction.bentukTindakan,
              statusPelaksanaan: latestAction.statusPelaksanaan,
              tanggalTindakan: latestAction.tanggalTindakan,
              catatan: latestAction.catatan,
            }
          : null,
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
  },

  // 4. Detail pelanggaran lengkap beserta histori tindak lanjut kronologis
  async getPelanggaranDetailWithFollowUp(id: number) {
    const pelanggaran = await pelanggaranRepository.findByIdWithTindakLanjut(id);
    if (!pelanggaran) {
      throw new AppError("Catatan pelanggaran tidak ditemukan", 404);
    }

    const sanksi = evaluasiSanksiSiswa(pelanggaran.siswa.totalPoin);
    const metaKasus =
      STATUS_TINDAK_LANJUT_META[pelanggaran.statusTindakLanjut as StatusTindakLanjutKasus] ?? {
        label: pelanggaran.statusTindakLanjut,
        badgeVariant: "neutral" as const,
      };

    const historiTindakLanjut = pelanggaran.tindakLanjut.map((tl) => {
      const isAuditLog =
        tl.catatan.startsWith("[AUDIT_STATUS]") ||
        tl.catatan.startsWith("[PERUBAHAN STATUS");
      return {
        id: tl.id,
        bentukTindakan: tl.bentukTindakan,
        bentukLabel:
          BENTUK_TINDAK_LANJUT_LABEL[tl.bentukTindakan as BentukTindakLanjut] ??
          tl.bentukTindakan,
        statusPelaksanaan: tl.statusPelaksanaan,
        tanggalTindakan:
          tl.tanggalTindakan instanceof Date
            ? tl.tanggalTindakan.toISOString().split("T")[0]
            : String(tl.tanggalTindakan).split("T")[0],
        pihakTerlibat: tl.pihakTerlibat,
        catatan: tl.catatan,
        isAuditLog,
        tenggatEvaluasi: tl.tenggatEvaluasi
          ? tl.tenggatEvaluasi instanceof Date
            ? tl.tenggatEvaluasi.toISOString().split("T")[0]
            : String(tl.tenggatEvaluasi).split("T")[0]
          : null,
        counselor: tl.counselor
          ? {
              id: tl.counselor.id,
              nip: tl.counselor.nip,
              nama: tl.counselor.nama_counselor,
            }
          : null,
        createdAt: tl.createdAt,
      };
    });

    const tindakanNyata = historiTindakLanjut.filter((tl) => !tl.isAuditLog);

    return {
      pelanggaran: {
        id: pelanggaran.id,
        jenisPelanggaran: pelanggaran.jenisPelanggaran,
        poin: pelanggaran.poin,
        keterangan: pelanggaran.keterangan,
        statusTindakLanjut: pelanggaran.statusTindakLanjut,
        statusLabel: metaKasus.label,
        badgeVariant: metaKasus.badgeVariant,
        createdAt: pelanggaran.createdAt,
        updatedAt: pelanggaran.updatedAt,
        guruBk: pelanggaran.counselor
          ? {
              id: pelanggaran.counselor.id,
              nip: pelanggaran.counselor.nip,
              nama: pelanggaran.counselor.nama_counselor,
            }
          : null,
      },
      siswa: {
        id: pelanggaran.siswa.id,
        nisn: pelanggaran.siswa.nisn,
        nipd: pelanggaran.siswa.nipd,
        nama: pelanggaran.siswa.nama_siswa,
        jenisKelamin: pelanggaran.siswa.jenis_kelamin,
        rombel: pelanggaran.siswa.rombel,
        totalPoin: pelanggaran.siswa.totalPoin,
        sanksiDss: sanksi
          ? {
              tahap: sanksi.tahap,
              tindakan: sanksi.tindakan,
              pihakTerlibat: sanksi.pihakTerlibat,
              statusKritis: sanksi.statusKritis,
            }
          : {
              tahap: "Disiplin / Aman (< 25 Poin)",
              tindakan: ["Siswa mematuhi tata tertib dengan baik."],
              pihakTerlibat: ["Siswa"],
              statusKritis: false,
            },
      },
      historiTindakLanjut,
      tindakLanjut: historiTindakLanjut,
      totalTindakan: tindakanNyata.length,
      totalAuditLog: historiTindakLanjut.length - tindakanNyata.length,
    };
  },

  // 5. Menambahkan log tindakan pembinaan baru secara atomik
  async addTindakLanjut(
    pelanggaranId: number,
    input: CreateTindakLanjutInput,
    counselorId?: number | null
  ) {
    const tanggalTindakan = new Date(input.tanggalTindakan);
    const tenggatEvaluasi = input.tenggatEvaluasi
      ? new Date(input.tenggatEvaluasi)
      : null;

    const result = await pelanggaranRepository.createTindakLanjut({
      pelanggaranId,
      counselorId: counselorId ?? null,
      bentukTindakan: input.bentukTindakan,
      statusPelaksanaan: input.statusPelaksanaan,
      statusKasusBaru: input.statusKasusBaru,
      tanggalTindakan,
      pihakTerlibat: input.pihakTerlibat,
      catatan: input.catatan,
      tenggatEvaluasi,
    });

    if (!result) {
      throw new AppError("Catatan pelanggaran tidak ditemukan", 404);
    }

    const metaKasus =
      STATUS_TINDAK_LANJUT_META[result.pelanggaran.statusTindakLanjut as StatusTindakLanjutKasus] ?? {
        label: result.pelanggaran.statusTindakLanjut,
        badgeVariant: "neutral" as const,
      };

    return {
      tindakLanjut: {
        id: result.tindakLanjut.id,
        bentukTindakan: result.tindakLanjut.bentukTindakan,
        bentukLabel:
          BENTUK_TINDAK_LANJUT_LABEL[result.tindakLanjut.bentukTindakan as BentukTindakLanjut] ??
          result.tindakLanjut.bentukTindakan,
        statusPelaksanaan: result.tindakLanjut.statusPelaksanaan,
        tanggalTindakan: input.tanggalTindakan,
        pihakTerlibat: result.tindakLanjut.pihakTerlibat,
        catatan: result.tindakLanjut.catatan,
        tenggatEvaluasi: input.tenggatEvaluasi ?? null,
        counselor: result.tindakLanjut.counselor
          ? {
              id: result.tindakLanjut.counselor.id,
              nip: result.tindakLanjut.counselor.nip,
              nama: result.tindakLanjut.counselor.nama_counselor,
            }
          : null,
        createdAt: result.tindakLanjut.createdAt,
      },
      statusKasus: {
        current: result.pelanggaran.statusTindakLanjut,
        label: metaKasus.label,
        badgeVariant: metaKasus.badgeVariant,
      },
    };
  },

  // 6. Mengubah status kasus pelanggaran dengan audit catatan
  async updateStatusKasus(
    pelanggaranId: number,
    input: UpdateStatusKasusInput,
    counselorId?: number | null
  ) {
    const result = await pelanggaranRepository.updateStatusKasus({
      pelanggaranId,
      status: input.status,
      counselorId: counselorId ?? null,
      catatanPerubahan: input.catatanPerubahan,
    });

    if (!result) {
      throw new AppError("Catatan pelanggaran tidak ditemukan", 404);
    }

    const metaKasus =
      STATUS_TINDAK_LANJUT_META[result.pelanggaran.statusTindakLanjut as StatusTindakLanjutKasus] ?? {
        label: result.pelanggaran.statusTindakLanjut,
        badgeVariant: "neutral" as const,
      };

    return {
      pelanggaranId: result.pelanggaran.id,
      status: result.pelanggaran.statusTindakLanjut,
      statusLabel: metaKasus.label,
      badgeVariant: metaKasus.badgeVariant,
      updatedAt: result.pelanggaran.updatedAt,
      auditLogCreated: Boolean(result.auditLog),
    };
  },

  // 7. Rekap status tindak lanjut seluruh database
  async getTindakLanjutStats() {
    return pelanggaranRepository.getFollowUpStats();
  },
};