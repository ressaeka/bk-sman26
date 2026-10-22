import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);

    if (!auth.siswaId) {
      throw new AppError("Profil siswa tidak valid pada akun ini", 400);
    }

    const rombel = auth.user.siswa?.rombel;
    const statuses = await jadwalAsesmenService.getAllStudentAssessmentStatuses(
      auth.siswaId,
      rombel
    );

    return successResponse("Status jadwal asesmen siswa berhasil dimuat", statuses);
  } catch (error) {
    return handleApiError(error);
  }
}
