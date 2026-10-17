import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);
    const url = new URL(req.url);

    let targetSiswaId: number | undefined;

    if (auth.role === "SISWA") {
      targetSiswaId = auth.siswaId ?? undefined;
      if (!targetSiswaId) {
        throw new AppError("Profil siswa tidak valid pada akun ini", 400);
      }
    } else {
      const queryParam = url.searchParams.get("siswaId");
      targetSiswaId = queryParam ? Number(queryParam) : undefined;
      if (!targetSiswaId || Number.isNaN(targetSiswaId)) {
        throw new AppError("Parameter query siswaId wajib disertakan", 400);
      }
    }

    const result = await AngketMasalahService.getLatestResult(targetSiswaId);
    return successResponse("Hasil asessment Angket Masalah berhasil dimuat", result);
  } catch (error) {
    return handleApiError(error);
  }
}