import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { activityService } from "@/services/activity.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);

    if (!auth.siswaId) {
      throw new AppError("Profil siswa tidak valid pada akun ini", 400);
    }

    const url = new URL(req.url);
    const limitQuery = url.searchParams.get("limit");
    const limit = limitQuery ? Math.min(10, Math.max(1, Number(limitQuery) || 5)) : 5;

    const activities = await activityService.getStudentRecentActivities(
      auth.siswaId,
      limit
    );

    return successResponse("Aktivitas terbaru berhasil dimuat", activities);
  } catch (error) {
    return handleApiError(error);
  }
}
