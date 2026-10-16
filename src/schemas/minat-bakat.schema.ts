import { z } from "zod";

export const riasecAnswerItemSchema = z.object({
  questionId: z
    .number({ message: "ID butir soal wajib disertakan" })
    .int("ID butir soal harus berupa bilangan bulat")
    .min(1, "ID butir soal minimal 1"),
  interested: z.boolean({
    message: "Status minat (interested) wajib diisi boolean (true/false)",
  }),
});

export const submitMinatBakatSchema = z.object({
  answers: z
    .array(riasecAnswerItemSchema)
    .min(1, "Daftar jawaban tidak boleh kosong"),
});

export type SubmitMinatBakatInput = z.infer<typeof submitMinatBakatSchema>;
export type RiasecAnswerItem = z.infer<typeof riasecAnswerItemSchema>;