import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { konselingService } from "@/services/konseling.service";
import { paginatedResponse, getPaginationParams, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const url = new URL(req.url);
    const { page, limit, sortOrder } = getPaginationParams(url);
    const status = url.searchParams.get("status") || undefined;

    const { items, total } = await konselingService.getAllSessionsForBk(page, limit, sortOrder, { status });

    return paginatedResponse(
      "Daftar permohonan konseling siswa berhasil dimuat",
      items,
      total,
      page,
      limit
    );
  } catch (error) {
    return handleApiError(error);
  }
}