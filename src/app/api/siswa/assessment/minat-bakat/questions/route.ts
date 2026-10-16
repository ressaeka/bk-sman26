import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { minatBakatService, isGrade10 } from "@/services/minat-bakat.service";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);

    // Validasi rombel khusus jika diakses oleh siswa
    if (auth.role === "SISWA" && !isGrade10(auth.user.siswa?.rombel)) {
      throw new AppError(
        `Akses ditolak. Asesmen Minat & Bakat khusus siswa Kelas 10 untuk persiapan pemetaan jurusan Kelas 11 (Rombel: ${auth.user.siswa?.rombel || "Tidak terdata"}).`,
        403
      );
    }

    const questions = minatBakatService.getQuestions();
    return successResponse("Daftar pertanyaan berhasil dimuat", questions);
  } catch (error) {
    return handleApiError(error);
  }
}