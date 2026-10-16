import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { konselingService } from "@/services/konseling.service";
import { updateKonselingBkSchema } from "@/schemas/konseling.schema";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const sessionId = Number(id);

    if (!sessionId) {
      throw new AppError("ID sesi konseling tidak valid", 400);
    }

    const body = await req.json();
    const { status, catatanGuruBK } = updateKonselingBkSchema.parse(body);

    const updated = await konselingService.updateSessionStatus(
      sessionId,
      auth.counselorId!,
      status,
      catatanGuruBK
    );

    return successResponse("Status dan catatan sesi konseling berhasil diperbarui", updated);
  } catch (error) {
    return handleApiError(error);
  }
}