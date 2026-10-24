import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { dashboardService } from "@/services/dashboard.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const stats = await dashboardService.getDashboardStats();

    return successResponse("Statistik dashboard Guru BK berhasil dimuat", stats);
  } catch (error) {
    return handleApiError(error);
  }
}
