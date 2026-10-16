import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { diagnostikService } from "@/services/diagnostik.service";
import { reviewDiagnostikSchema } from "@/schemas/diagnostik.schema";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

// 1. GET: Ambil detail hasil tes diagnostik berdasarkan ID tes
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, ["SISWA", "BK"]);
    const { id } = await props.params;
    const diagnostikId = Number(id);

    if (!diagnostikId || Number.isNaN(diagnostikId)) {
      throw new AppError("ID tes diagnostik tidak valid", 400);
    }

    const result = await diagnostikService.getResultById(diagnostikId);

    if (!result) {
      throw new AppError("Data tes diagnostik tidak ditemukan", 404);
    }

    // Proteksi Keamanan: Siswa hanya boleh membuka hasil tes miliknya sendiri
    if (auth.role === "SISWA" && result.siswaId !== auth.siswaId) {
      throw new AppError("Akses ditolak: Anda tidak memiliki akses ke data ini", 403);
    }

    return successResponse("Hasil asesmen diagnostik kualitatif berhasil dimuat", result);
  } catch (error) {
    return handleApiError(error);
  }
}

// 2. PATCH: Guru BK meninjau hasil & menyimpan catatan telaah
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const diagnostikId = Number(id);

    if (!diagnostikId || Number.isNaN(diagnostikId)) {
      throw new AppError("ID tes diagnostik tidak valid", 400);
    }

    const body = await req.json().catch(() => ({}));
    const { catatanGuruBK } = reviewDiagnostikSchema.parse(body);

    const updated = await diagnostikService.reviewAssessment(
      diagnostikId,
      auth.counselorId!,
      catatanGuruBK
    );

    return successResponse("Telaah evaluasi kualitatif Guru BK berhasil disimpan", updated);
  } catch (error) {
    return handleApiError(error);
  }
}