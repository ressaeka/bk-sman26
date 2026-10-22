import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import {
  createJadwalAsesmenSchema,
  queryJadwalAsesmenSchema,
} from "@/schemas/jadwal-asesmen.schema";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const url = new URL(req.url);
    const query = {
      tipe: url.searchParams.get("tipe") || undefined,
      targetTingkat: url.searchParams.get("targetTingkat") || undefined,
      targetRombel: url.searchParams.get("targetRombel") || undefined,
      isActive: url.searchParams.get("isActive") || undefined,
    };

    const parsedQuery = queryJadwalAsesmenSchema.parse(query);

    const schedules = await jadwalAsesmenService.listSchedules({
      tipe: parsedQuery.tipe,
      targetTingkat: parsedQuery.targetTingkat,
      targetRombel: parsedQuery.targetRombel,
      isActive:
        parsedQuery.isActive === "true"
          ? true
          : parsedQuery.isActive === "false"
          ? false
          : undefined,
    });

    return successResponse("Daftar jadwal asesmen berhasil dimuat", schedules);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["BK"]);

    if (!auth.counselorId) {
      throw new AppError("Profil Guru BK tidak ditemukan pada sesi ini", 400);
    }

    const body = await req.json();
    const parsed = createJadwalAsesmenSchema.parse(body);

    const created = await jadwalAsesmenService.createSchedule(auth.counselorId, {
      tipe: parsed.tipe,
      judul: parsed.judul,
      deskripsi: parsed.deskripsi,
      tanggalMulai: new Date(parsed.tanggalMulai),
      tanggalSelesai: new Date(parsed.tanggalSelesai),
      targetTingkat: parsed.targetTingkat,
      targetRombel: parsed.targetRombel,
      isActive: parsed.isActive,
    });

    return successResponse("Jadwal asesmen berhasil dibuat", created, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
