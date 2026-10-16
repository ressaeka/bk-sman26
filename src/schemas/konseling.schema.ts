import { z } from 'zod';
import { STATUS_KONSELING } from '@/constants/konseling.constant';

export const createKonselingSchema = z.object({
  tanggal: z
    .string()
    .min(1, 'Tanggal konseling wajib diisi')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Format tanggal tidak valid (gunakan format YYYY-MM-DD)',
    }),
  jam: z
    .string()
    .trim()
    .min(1, 'Jam konseling wajib diisi')
    .max(10, 'Jam maksimal 10 karakter'),
  topik: z
    .string()
    .trim()
    .min(1, 'Topik konseling wajib diisi')
    .max(150, 'Topik maksimal 150 karakter'),
  keluhan: z
    .string()
    .trim()
    .max(2000, 'Keluhan maksimal 2000 karakter')
    .optional()
    .nullable(),
});

export type CreateKonselingInput = z.infer<typeof createKonselingSchema>;

export const updateKonselingBkSchema = z.object({
  status: z.enum(
    [
      STATUS_KONSELING.DISETUJUI,
      STATUS_KONSELING.DITOLAK,
      STATUS_KONSELING.SELESAI,
    ],
    {
      message: 'Status harus berupa DISETUJUI, DITOLAK, atau SELESAI',
    },
  ),
  catatanGuruBK: z
    .string()
    .trim()
    .max(3000, 'Catatan Guru BK maksimal 3000 karakter')
    .optional()
    .nullable(),
});

export type UpdateKonselingBkInput = z.infer<typeof updateKonselingBkSchema>;
