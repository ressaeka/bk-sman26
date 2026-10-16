import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { diagnostikService } from "@/services/diagnostik.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["SISWA", "BK"]);
    const questions = diagnostikService.getDaftarPertanyaan();

    return successResponse("Daftar butir masalah Test Diagnostik / Angket Masalah berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}