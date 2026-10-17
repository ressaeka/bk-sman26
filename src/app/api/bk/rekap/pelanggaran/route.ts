import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { filterRekapPelanggaranSchema } from "@/schemas/pelanggaran.schema";
import { paginatedResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const url = new URL(req.url);
    

    // Kumpulkan semua parameter URL untuk divalidasi oleh Zod
    const queryParams = {
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      sortOrder: url.searchParams.get("sortOrder") || undefined,
      rombel: url.searchParams.get("rombel") || undefined,
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
    };

    const { page, limit, rombel, search } = filterRekapPelanggaranSchema.parse(queryParams);

    const result = await pelanggaranService.getRekapPelanggaran(page, limit, {
      rombel,
      search,
    });

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