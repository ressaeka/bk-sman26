import { z } from "zod";

// Siswa hanya mengirim butir masalah yang dipilih/dibulatkan
export const submitDiagnostikSchema = z.object({
  masalahIds: z
    .array(z.number().int().positive("ID butir masalah harus bilangan bulat positif"))
    .min(1, "Pilih minimal 1 butir masalah yang sedang dialami")
    .max(8, "Maksimal memilih 8 butir masalah"),
});

// Guru BK meninjau hasil centangan siswa (catatan bersifat opsional)
export const reviewDiagnostikSchema = z.object({
  catatanGuruBK: z
    .string()
    .trim()
    .max(5000, "Catatan maksimal 5000 karakter")
    .optional()
    .nullable(),
});

export type SubmitDiagnostikInput = z.infer<typeof submitDiagnostikSchema>;
export type ReviewDiagnostikInput = z.infer<typeof reviewDiagnostikSchema>;