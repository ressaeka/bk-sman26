import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { filterRekapPelanggaranSchema } from "@/schemas/pelanggaran.schema";
import { paginatedResponse, getPaginationParams, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const url = new URL(req.url);
    const { page, limit } = getPaginationParams(url);

    const queryParams = {
      rombel: url.searchParams.get("rombel") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
    };

    const validatedFilters = filterRekapPelanggaranSchema.parse(queryParams);

    const result = await pelanggaranService.getRekapPelanggaran(
      page,
      limit,
      validatedFilters
    );

    return paginatedResponse(
      "Rekapitulasi kedisiplinan siswa berhasil dimuat",
      result.items,
      result.total,
      result.page,
      result.limit
    );
  } catch (error) {
    return handleApiError(error);
  }
}