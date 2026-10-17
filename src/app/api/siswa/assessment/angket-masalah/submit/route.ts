import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
import { submitAngketMasalahSchema } from "@/schemas/angket-masalah";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
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