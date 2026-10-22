import { z } from "zod";
import { TIPE_ASESMEN } from "@/constants/jadwal-asesmen.constant";

export const baseJadwalAsesmenSchema = z.object({
  tipe: z.enum([
    TIPE_ASESMEN.ANGKET_MASALAH,
    TIPE_ASESMEN.GAYA_BELAJAR,
    TIPE_ASESMEN.MINAT_BAKAT,
  ]),
  judul: z.string().min(3, "Judul minimal 3 karakter").max(150),
  deskripsi: z.string().max(1000).optional().nullable(),
  tanggalMulai: z.string().datetime({ message: "Format tanggal mulai harus berupa ISO string" }),
  tanggalSelesai: z.string().datetime({ message: "Format tanggal selesai harus berupa ISO string" }),
  targetTingkat: z.string().max(10).optional().nullable(), // e.g. "ALL", "10", "X", "11", "XII"
  targetRombel: z.string().max(50).optional().nullable(), // e.g. "X-1", "XII-IPA-1"
  isActive: z.boolean().optional().default(true),
});

export const createJadwalAsesmenSchema = baseJadwalAsesmenSchema.refine(
  (data) => new Date(data.tanggalSelesai) > new Date(data.tanggalMulai),
  {
    message: "Waktu selesai harus lebih besar dari waktu mulai",
    path: ["tanggalSelesai"],
  }
);

export const updateJadwalAsesmenSchema = baseJadwalAsesmenSchema.partial().refine(
  (data) => {
    if (data.tanggalMulai && data.tanggalSelesai) {
      return new Date(data.tanggalSelesai) > new Date(data.tanggalMulai);
    }
    return true;
  },
  {
    message: "Waktu selesai harus lebih besar dari waktu mulai",
    path: ["tanggalSelesai"],
  }
);

export const queryJadwalAsesmenSchema = z.object({
  tipe: z.enum([
    TIPE_ASESMEN.ANGKET_MASALAH,
    TIPE_ASESMEN.GAYA_BELAJAR,
    TIPE_ASESMEN.MINAT_BAKAT,
  ]).optional(),
  targetTingkat: z.string().optional(),
  targetRombel: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional(),
});
