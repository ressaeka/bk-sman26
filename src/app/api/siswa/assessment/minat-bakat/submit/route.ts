import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { minatBakatService } from "@/services/minat-bakat.service";
import { submitMinatBakatSchema } from "@/schemas/minat-bakat.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
    const body = await req.json();
    const parsed = submitMinatBakatSchema.parse(body);

    const result = await minatBakatService.submitAssessment(auth.siswaId!, parsed.answers);

    return successResponse("Hasil asesmen minat dan bakat berhasil dihitung dan disimpan", result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}