import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { konselingService } from "@/services/konseling.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
    const { id } = await props.params;
    const sessionId = Number(id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      throw new AppError("ID sesi konseling tidak valid", 400);
    }

    const session = await konselingService.getSiswaSessionById(
      sessionId,
      auth.siswaId!
    );

    return successResponse("Detail sesi konseling berhasil dimuat", session);
  } catch (error) {
    return handleApiError(error);
  }
}
