import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { minatBakatService, isGrade10 } from "@/services/minat-bakat.service";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);

    // Validasi khusus jika diakses oleh siswa
    if (auth.role === "SISWA") {
      if (!isGrade10(auth.user.siswa?.rombel)) {
        throw new AppError(
          `Akses ditolak. Asesmen Minat & Bakat khusus siswa Kelas 10 untuk persiapan pemetaan jurusan Kelas 11 (Rombel: ${auth.user.siswa?.rombel || "Tidak terdata"}).`,
          403
        );
      }

      // Kunci keamanan: Pastikan jadwal aktif untuk siswa ini
      await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
        auth.siswaId!,
        auth.user.siswa?.rombel,
        "MINAT_BAKAT"
      );
    }

    const questions = minatBakatService.getQuestions();
    return successResponse("Daftar pertanyaan berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}