import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { AngketMasalahService } from "@/services/angket-masalah.service";
import { reviewAngketMasalahSchema } from "@/schemas/angket-masalah";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

// src/app/api/bk/assessment/angket-masalah/[id]/route.ts
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // Kunci hanya untuk Guru BK
    await requireAuth(req, ["BK"]);
    const { id } = await props.params;
    const angketMasalahId = Number(id);

    if (!angketMasalahId || Number.isNaN(angketMasalahId)) {
      throw new AppError("ID Test Angket Masalah tidak valid", 400);
    }

    const result = await AngketMasalahService.getResultById(angketMasalahId);
    if (!result) {
      throw new AppError("Data Test Angket Masalah tidak ditemukan", 404);
    }

    return successResponse("Hasil assessment Angket Masalah kualitatif berhasil dimuat", result);
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
    const angketMasalahId = Number(id);

    if (!angketMasalahId || Number.isNaN(angketMasalahId)) {
      throw new AppError("ID Test Angket Masalah tidak valid", 400);
    }

    const body = await req.json().catch(() => ({}));
    const { catatanGuruBK } = reviewAngketMasalahSchema.parse(body);

    const updated = await AngketMasalahService.reviewAssessment(
      angketMasalahId,
      auth.counselorId!,
      catatanGuruBK
    );

    return successResponse("Telaah Evaluasi Kualitatif Guru BK berhasil disimpan", updated);
  } catch (error) {
    return handleApiError(error);
  }
}