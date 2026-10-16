import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { konselingService } from "@/services/konseling.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
    const history = await konselingService.getSiswaHistory(auth.siswaId!);

    return successResponse("Riwayat sesi konseling berhasil dimuat", history);
  } catch (error) {
    return handleApiError(error);
  }
}