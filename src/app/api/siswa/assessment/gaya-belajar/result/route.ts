import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { gayaBelajarService } from "@/services/gaya-belajar.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);
    const url = new URL(req.url);

    // Anti-BOLA: Siswa hanya boleh membaca miliknya sendiri, Guru BK membaca via query siswaId
    const targetSiswaId = auth.role === "SISWA"
      ? auth.siswaId
      : Number(url.searchParams.get("siswaId"));

    if (!targetSiswaId || isNaN(targetSiswaId)) {
      throw new AppError("Parameter query siswaId wajib disertakan", 400);
    }

    const result = await gayaBelajarService.getLatestResult(targetSiswaId);
    return successResponse("Hasil asesmen gaya belajar berhasil dimuat", result);
  } catch (error) {
    return handleApiError(error);
  }
}