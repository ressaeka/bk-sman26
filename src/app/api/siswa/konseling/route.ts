import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { konselingService } from "@/services/konseling.service";
import { createKonselingSchema } from "@/schemas/konseling.schema";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);
    const body = await req.json();
    const data = createKonselingSchema.parse(body);

    const result = await konselingService.createSession(auth.siswaId!, data);
    return successResponse(
      "Permohonan sesi konseling berhasil diajukan dan menunggu persetujuan Guru BK",
      result,
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}