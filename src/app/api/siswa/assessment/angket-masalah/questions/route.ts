import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["SISWA", "BK"]);
    const questions = AngketMasalahService.getDaftarPertanyaan();

    return successResponse("Daftar butir Test Angket Masalah berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}