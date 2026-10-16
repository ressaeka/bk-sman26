import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { gayaBelajarService } from "@/services/gaya-belajar.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["SISWA", "BK"]);
    const questions = gayaBelajarService.getQuestions();

    return successResponse("Daftar pertanyaan asesmen gaya belajar (VAK) berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}