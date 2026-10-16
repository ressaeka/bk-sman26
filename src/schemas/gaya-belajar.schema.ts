import { z } from "zod";

export const answerItemSchema = z.object({
  questionId: z.number().int().min(1, "ID soal tidak valid"),
  choice: z.enum(["A", "B", "C"], {
    message: "Pilihan jawaban harus berupa A, B, atau C",
  }),
});

export const submitGayaBelajarSchema = z.object({
  answers: z
    .array(answerItemSchema)
    .min(1, "Daftar jawaban tidak boleh kosong"),
});

export type SubmitGayaBelajarInput = z.infer<typeof submitGayaBelajarSchema>;
export type NormalizedAnswer = z.infer<typeof answerItemSchema>;