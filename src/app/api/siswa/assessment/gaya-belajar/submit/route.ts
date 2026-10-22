import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { gayaBelajarService } from "@/services/gaya-belajar.service";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { submitGayaBelajarSchema } from "@/schemas/gaya-belajar.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);

    // Kunci keamanan: Pastikan jadwal asesmen saat ini sedang berlangsung untuk siswa ini
    await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
      auth.siswaId!,
      auth.user.siswa?.rombel,
      "GAYA_BELAJAR"
    );

    const body = await req.json();
    const parsed = submitGayaBelajarSchema.parse(body);

    const result = await gayaBelajarService.submitAssessment(auth.siswaId!, parsed.answers);

    return successResponse("Hasil asesmen gaya belajar berhasil dihitung dan disimpan", result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}