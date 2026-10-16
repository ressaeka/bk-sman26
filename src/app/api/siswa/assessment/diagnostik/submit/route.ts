import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { diagnostikService } from "@/services/diagnostik.service";
import { submitDiagnostikSchema } from "@/schemas/diagnostik.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
    const body = await req.json();
    const parsed = submitDiagnostikSchema.parse(body);

    const result = await diagnostikService.submitAssessment(
      auth.siswaId!,
      parsed.masalahIds,
    );

    return successResponse(
      "Daftar kendala Diagnostik / Angket Masalah berhasil disimpan dan menunggu telaah Guru BK",
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}