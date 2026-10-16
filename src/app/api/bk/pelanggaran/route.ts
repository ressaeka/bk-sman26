import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { pelanggaranService } from "@/services/pelanggaran.service";
import { createPelanggaranSchema } from "@/schemas/pelanggaran.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["BK"]);
    const body = await req.json();
    const data = createPelanggaranSchema.parse(body);

    const result = await pelanggaranService.recordPelanggaran(data, auth.user.id);
    
    return successResponse(
      `Poin pelanggaran berhasil dicatat. Status kedisiplinan siswa: ${result.dss.label}`,
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}