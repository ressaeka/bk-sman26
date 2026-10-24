import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import {
  createTindakLanjutSchema,
  updateStatusKasusSchema,
} from "@/schemas/pelanggaran.schema";
import {
  successResponse,
  handleApiError,
  AppError,
} from "@/lib/utils/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET: Mengambil detail satu pelanggaran beserta seluruh riwayat log tindak lanjut
 */
export async function GET(req: NextRequest, context: RouteParams) {
  try {
    await requireAuth(req, ["BK"]);

    const { id } = await context.params;
    const pelanggaranId = Number(id);

    if (isNaN(pelanggaranId) || pelanggaranId <= 0) {
      throw new AppError("ID Pelanggaran tidak valid", 400);
    }

    const data = await pelanggaranService.getPelanggaranDetailWithFollowUp(pelanggaranId);

    return successResponse("Riwayat tindak lanjut pelanggaran berhasil dimuat", data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST: Menambahkan catatan tindakan pembinaan baru pada pelanggaran
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const auth = await requireAuth(req, ["BK"]);

    const { id } = await context.params;
    const pelanggaranId = Number(id);

    if (isNaN(pelanggaranId) || pelanggaranId <= 0) {
      throw new AppError("ID Pelanggaran tidak valid", 400);
    }

    const body = await req.json();
    const validatedData = createTindakLanjutSchema.parse(body);

    // counselorId diambil dari token autentikasi server, bukan payload klien
    const result = await pelanggaranService.addTindakLanjut(
      pelanggaranId,
      validatedData,
      auth.counselorId
    );

    return successResponse(
      `Tindakan pembinaan berhasil dicatat. Status kasus: ${result.statusKasus.label}`,
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH: Mengubah status kasus pelanggaran dengan pencatatan audit log
 */
export async function PATCH(req: NextRequest, context: RouteParams) {
  try {
    const auth = await requireAuth(req, ["BK"]);

    const { id } = await context.params;
    const pelanggaranId = Number(id);

    if (isNaN(pelanggaranId) || pelanggaranId <= 0) {
      throw new AppError("ID Pelanggaran tidak valid", 400);
    }

    const body = await req.json();
    const validatedData = updateStatusKasusSchema.parse(body);

    const result = await pelanggaranService.updateStatusKasus(
      pelanggaranId,
      validatedData,
      auth.counselorId
    );

    return successResponse(
      `Status kasus pelanggaran berhasil diperbarui menjadi ${result.statusLabel}`,
      result
    );
  } catch (error) {
    return handleApiError(error);
  }
}
