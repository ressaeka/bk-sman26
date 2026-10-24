import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { createPelanggaranSchema } from "@/schemas/pelanggaran.schema";
import { StatusTindakLanjutKasus } from "@/constants/pelanggaran.constant";
import { successResponse, paginatedResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, ["BK"]);

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
    const statusParam = url.searchParams.get("status") || undefined;
    const rombel = url.searchParams.get("rombel") || undefined;
    const search = url.searchParams.get("search") || undefined;

    const validStatuses: StatusTindakLanjutKasus[] = [
      "BELUM_DITANGANI",
      "DALAM_PEMBINAAN",
      "SELESAI",
      "DIBATALKAN",
    ];
    const status = validStatuses.includes(statusParam as StatusTindakLanjutKasus)
      ? (statusParam as StatusTindakLanjutKasus)
      : undefined;

    const result = await pelanggaranService.getAllPelanggaran(page, limit, {
      status,
      rombel,
      search,
    });

    return paginatedResponse(
      "Daftar pelanggaran siswa berhasil dimuat",
      result.items,
      result.total,
      result.page,
      result.limit
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["BK"]);
    const body = await req.json();
    const data = createPelanggaranSchema.parse(body);

    // Kirim auth.counselorId langsung (sudah di-resolve oleh requireAuth)
    const result = await pelanggaranService.recordPelanggaran(data, auth.counselorId);

    return successResponse(
      `Poin pelanggaran berhasil dicatat. Status kedisiplinan siswa: ${result.dss.sanksi.tahap}`,
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}