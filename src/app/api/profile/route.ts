import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { successResponse, handleApiError, AppError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req, ["SISWA"]);

    const siswa = auth.user.siswa;
    if (!siswa) {
      throw new AppError("Data siswa tidak ditemukan", 404);
    }

    return successResponse("Profil siswa berhasil diambil", {
      id: siswa.id,
      nisn: siswa.nisn,
      nama: siswa.nama_siswa,
      jenisKelamin: siswa.jenis_kelamin,
      rombel: siswa.rombel,
      totalPoin: siswa.totalPoin,
    });
  } catch (error) {
    return handleApiError(error);
  }
}