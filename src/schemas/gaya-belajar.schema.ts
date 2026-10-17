import { z } from "zod";

export const answerItemSchema = z.object({
  questionId: z.number().int().min(1).max(30, "ID soal harus antara 1 sampai 30"),
  choice: z.enum(["A", "B", "C"], {
    message: "Pilihan jawaban harus berupa A, B, atau C",
  }),
});

export const submitGayaBelajarSchema = z.object({
  answers: z
    .array(answerItemSchema)
    .length(30, "Semua 30 butir pertanyaan gaya belajar wajib dijawab")
    .refine(
      (items) => {
        const ids = new Set(items.map((item) => item.questionId));
        return ids.size === 30;
      },
      {
        message: "Daftar jawaban mengandung nomor soal yang duplikat atau terlewat",
      }
    ),
});

export type SubmitGayaBelajarInput = z.infer<typeof submitGayaBelajarSchema>;
export type NormalizedAnswer = z.infer<typeof answerItemSchema>;