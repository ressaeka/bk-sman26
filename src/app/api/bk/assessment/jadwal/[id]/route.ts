import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { updateJadwalAsesmenSchema } from "@/schemas/jadwal-asesmen.schema";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const jadwalId = Number(id);

    if (!jadwalId || Number.isNaN(jadwalId)) {
      throw new AppError("ID jadwal tidak valid", 400);
    }

    const schedule = await jadwalAsesmenService.getScheduleById(jadwalId);
    return successResponse("Detail jadwal asesmen berhasil dimuat", schedule);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const jadwalId = Number(id);

    if (!jadwalId || Number.isNaN(jadwalId)) {
      throw new AppError("ID jadwal tidak valid", 400);
    }

    const body = await req.json();
    const parsed = updateJadwalAsesmenSchema.parse(body);

    const updated = await jadwalAsesmenService.updateSchedule(jadwalId, {
      judul: parsed.judul,
      deskripsi: parsed.deskripsi,
      tanggalMulai: parsed.tanggalMulai ? new Date(parsed.tanggalMulai) : undefined,
      tanggalSelesai: parsed.tanggalSelesai ? new Date(parsed.tanggalSelesai) : undefined,
      targetTingkat: parsed.targetTingkat,
      targetRombel: parsed.targetRombel,
      isActive: parsed.isActive,
    });

    return successResponse("Jadwal asesmen berhasil diperbarui", updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const jadwalId = Number(id);

    if (!jadwalId || Number.isNaN(jadwalId)) {
      throw new AppError("ID jadwal tidak valid", 400);
    }

    await jadwalAsesmenService.deleteSchedule(jadwalId);
    return successResponse("Jadwal asesmen berhasil dihapus", null);
  } catch (error) {
    return handleApiError(error);
  }
}
