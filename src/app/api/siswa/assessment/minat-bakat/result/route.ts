import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { minatBakatService } from "@/services/minat-bakat.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);
    const url = new URL(req.url);

    // Proteksi BOLA: Siswa hanya dapat membaca miliknya sendiri
    const targetSiswaId =
      auth.role === "SISWA" ? auth.siswaId : Number(url.searchParams.get("siswaId"));

    if (!targetSiswaId || isNaN(targetSiswaId)) {
      throw new AppError("Parameter query siswaId wajib disertakan", 400);
    }

    const result = await minatBakatService.getLatestResult(targetSiswaId);
    return successResponse("Hasil asesmen minat dan bakat berhasil dimuat", result);
  } catch (error) {
    return handleApiError(error);
  }
}