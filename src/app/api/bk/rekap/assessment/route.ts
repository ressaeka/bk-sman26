import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { filterRekapAssessmentSchema } from "@/schemas/pelanggaran.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);
    const url = new URL(req.url);
    const queryParams = {
      rombel: url.searchParams.get("rombel") || undefined,
    };

    const validatedFilters = filterRekapAssessmentSchema.parse(queryParams);
    const result = await pelanggaranService.getRekapAssessment(validatedFilters.rombel);

    return successResponse(
      "Rekapitulasi hasil asesmen gaya belajar dan minat bakat berhasil dimuat",
      result
    );
  } catch (error) {
    return handleApiError(error);
  }
}