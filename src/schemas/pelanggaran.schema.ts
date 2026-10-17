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