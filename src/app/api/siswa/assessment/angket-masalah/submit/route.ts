import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
import { jadwalAsesmenService } from "@/services/jadwal-asesmen.service";
import { submitAngketMasalahSchema } from "@/schemas/angket-masalah";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);

    // Kunci keamanan: Pastikan jadwal asesmen saat ini sedang berlangsung untuk siswa ini
    await jadwalAsesmenService.assertStudentCanWorkOnAssessment(
      auth.siswaId!,
      auth.user.siswa?.rombel,
      "ANGKET_MASALAH"
    );

    const body = await req.json();
    const parsed = submitAngketMasalahSchema.parse(body);

    const result = await AngketMasalahService.submitAssessment(
      auth.siswaId!,
      parsed.masalahIds,
    );

    return successResponse(
      "Daftar kendala Angket Masalah berhasil disimpan dan menunggu telaah Guru BK",
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}