import { z } from "zod";

export const riasecAnswerItemSchema = z.object({
  questionId: z
    .number({ message: "ID butir soal wajib disertakan" })
    .int("ID butir soal harus berupa bilangan bulat")
    .min(1, "ID butir soal minimal 1")
    .max(42, "ID butir soal maksimal 42"),
  interested: z.boolean({
    message: "Status minat (interested) wajib diisi boolean (true/false)",
  }),
});

export const submitMinatBakatSchema = z.object({
  answers: z
    .array(riasecAnswerItemSchema)
    .length(42, "Semua 42 butir pertanyaan minat & bakat wajib dijawab")
    .refine(
      (items) => {
        const uniqueIds = new Set(items.map((item) => item.questionId));
        return uniqueIds.size === 42;
      },
      {
        message: "Daftar jawaban mengandung nomor soal yang duplikat atau belum lengkap",
      }
    ),
});

export type SubmitMinatBakatInput = z.infer<typeof submitMinatBakatSchema>;
export type RiasecAnswerItem = z.infer<typeof riasecAnswerItemSchema>;