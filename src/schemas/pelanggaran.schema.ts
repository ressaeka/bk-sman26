import { z } from "zod";

/**
 * Validasi form pencatatan poin pelanggaran oleh Guru BK
 */
export const createPelanggaranSchema = z.object({
  siswaId: z.coerce
    .number({ message: "ID Siswa wajib diisi" })
    .int("ID Siswa harus berupa bilangan bulat")
    .positive("ID Siswa tidak valid"),
  jenisPelanggaran: z
    .string({ message: "Jenis pelanggaran wajib diisi" })
    .trim()
    .min(3, "Jenis pelanggaran minimal 3 karakter")
    .max(255, "Jenis pelanggaran maksimal 255 karakter"),
  poin: z.coerce
    .number({ message: "Poin pelanggaran wajib diisi" })
    .int("Poin harus berupa bilangan bulat")
    .min(1, "Poin pelanggaran minimal 1")
    .max(100, "Maksimal poin pelanggaran sekali catat adalah 100"),
  keterangan: z
    .string()
    .trim()
    .max(1000, "Keterangan maksimal 1000 karakter")
    .optional()
    .nullable(),
});

export type CreatePelanggaranInput = z.infer<typeof createPelanggaranSchema>;

/**
 * Validasi query param untuk rekapitulasi pelanggaran & DSS
 */
export const filterRekapPelanggaranSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  rombel: z.string().trim().optional(),
  status: z.string().trim().optional(),
  rawanDo: z
    .string()
    .optional()
    .transform((val) => val === "true" || val === "1"),
  search: z.string().trim().optional(),
});

export type FilterRekapPelanggaranInput = z.infer<typeof filterRekapPelanggaranSchema>;

/**
 * Validasi query param untuk rekapitulasi hasil asesmen VAK & RIASEC
 */
export const filterRekapAssessmentSchema = z.object({
  rombel: z.string().trim().optional(),
});

export type FilterRekapAssessmentInput = z.infer<typeof filterRekapAssessmentSchema>;

/**
 * Validasi ketat format tanggal kalender YYYY-MM-DD
 */
function isValidDateString(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [y, m, d] = val.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/**
 * Validasi form pencatatan tindakan pembinaan pelanggaran oleh Guru BK
 */
export const createTindakLanjutSchema = z.object({
  bentukTindakan: z.enum([
    "PEMANGGILAN_SISWA",
    "PEMANGGILAN_ORANG_TUA",
    "SURAT_PERNYATAAN",
    "KONSELING_INDIVIDUAL",
    "PERTEMUAN_KASUS",
    "SANKSI_EDUKATIF",
    "LAINNYA",
  ], { message: "Bentuk tindakan tidak valid" }),
  statusPelaksanaan: z.enum(["DIRENCANAKAN", "TERLAKSANA", "BATAL_TERTUNDA"], {
    message: "Status pelaksanaan tindakan tidak valid",
  }).default("TERLAKSANA"),
  statusKasusBaru: z.enum(["BELUM_DITANGANI", "DALAM_PEMBINAAN", "SELESAI", "DIBATALKAN"], {
    message: "Status kasus baru tidak valid",
  }).optional(),
  tanggalTindakan: z
    .string({ message: "Tanggal tindakan wajib diisi" })
    .refine(isValidDateString, {
      message: "Format tanggal tindakan harus YYYY-MM-DD dan merupakan tanggal kalender yang valid",
    }),
  pihakTerlibat: z
    .string()
    .trim()
    .max(255, "Pihak terlibat maksimal 255 karakter")
    .optional()
    .nullable(),
  catatan: z
    .string({ message: "Catatan hasil pembinaan wajib diisi" })
    .trim()
    .min(5, "Catatan pembinaan minimal 5 karakter")
    .max(2000, "Catatan pembinaan maksimal 2000 karakter")
    .refine(
      (val) => {
        const clean = val.trim();
        return (
          !clean.startsWith("[AUDIT_STATUS]") &&
          !clean.startsWith("[PERUBAHAN STATUS")
        );
      },
      {
        message:
          "Catatan tindakan pembinaan tidak boleh menggunakan prefix audit sistem ('[AUDIT_STATUS]' atau '[PERUBAHAN STATUS')",
      }
    ),
  tenggatEvaluasi: z
    .string()
    .refine(isValidDateString, {
      message: "Format tenggat evaluasi harus YYYY-MM-DD dan valid",
    })
    .optional()
    .nullable(),
});

export type CreateTindakLanjutInput = z.infer<typeof createTindakLanjutSchema>;

/**
 * Validasi pembaruan status kasus pelanggaran
 */
export const updateStatusKasusSchema = z.object({
  status: z.enum(["BELUM_DITANGANI", "DALAM_PEMBINAAN", "SELESAI", "DIBATALKAN"], {
    message: "Status kasus tidak valid",
  }),
  catatanPerubahan: z
    .string({ message: "Alasan perubahan status wajib diisi" })
    .trim()
    .min(5, "Alasan perubahan status minimal 5 karakter")
    .max(1000, "Catatan perubahan maksimal 1000 karakter"),
});

export type UpdateStatusKasusInput = z.infer<typeof updateStatusKasusSchema>;