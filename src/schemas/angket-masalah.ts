import { z } from "zod";

export const submitAngketMasalahSchema = z.object({
  masalahIds: z
    .array(z.number().int().positive("ID butir masalah harus berupa angka positif"))
    .min(1, "Pilih minimal 1 butir masalah yang sedang dialami")
    .max(99, "Maksimal memilih 99 butir masalah")
    .refine((items) => new Set(items).size === items.length, {
      message: "Daftar butir masalah tidak boleh mengandung pilihan duplikat",
    }),
});

export const reviewAngketMasalahSchema = z.object({
  catatanGuruBK: z
    .string()
    .trim()
    .max(5000, "Catatan maksimal 5000 karakter")
    .optional()
    .nullable(),
});

export type SubmitangketMasalahInput = z.infer<typeof submitAngketMasalahSchema>;
export type ReviewangketMasalahInput = z.infer<typeof reviewAngketMasalahSchema>;