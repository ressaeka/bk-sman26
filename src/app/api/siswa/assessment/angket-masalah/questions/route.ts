import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
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
        "ANGKET_MASALAH"
      );
    }

    const questions = AngketMasalahService.getDaftarPertanyaan();

    return successResponse("Daftar butir Test Angket Masalah berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}