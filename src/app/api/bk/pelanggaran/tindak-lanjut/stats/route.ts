import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

/**
 * GET: Mengambil agregasi statistik status tindak lanjut seluruh database
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const stats = await pelanggaranService.getTindakLanjutStats();

    return successResponse("Statistik tindak lanjut pelanggaran berhasil dimuat", stats);
  } catch (error) {
    return handleApiError(error);
  }
}
