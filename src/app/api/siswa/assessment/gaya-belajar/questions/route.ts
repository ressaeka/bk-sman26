import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { gayaBelajarService } from "@/services/gaya-belajar.service";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);

    // Kunci keamanan: Siswa hanya dapat mengambil bank soal jika jadwal aktif untuk kelasnya
    if (auth.role === "SISWA") {
      await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
        auth.siswaId!,
        auth.user.siswa?.rombel,
        "GAYA_BELAJAR"
      );
    }

    const questions = gayaBelajarService.getQuestions();

    return successResponse("Daftar pertanyaan asesmen gaya belajar (VAK) berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}