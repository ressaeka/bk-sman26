import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AUTH_CONSTANTS } from "@/constants/auth.constant";
import { AppError } from "@/lib/utils/response";

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
) {
  // 1. Ambil token langsung dari cookie request
  const token = req.cookies.get(AUTH_CONSTANTS.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Sesi tidak valid atau telah kedaluwarsa.", 401);
  }

  // 2. Hash token SHA-256 untuk dicocokkan ke database
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // 3. Cari sesi aktif di database
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        include: {
          role: true,
          siswa: true,
          counselor: true,
        },
      },
    },
  });

  // 4. Validasi keaktifan sesi dan user
  if (!session || session.expiresAt < new Date() || !session.user || !session.user.isActive) {
    throw new AppError("Sesi tidak valid atau telah kedaluwarsa.", 401);
  }

  const user = session.user;
  const roleName = user.role.nama_role;

  // 5. Validasi Role Guard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(roleName)) {
    throw new AppError("Akses ditolak. Anda tidak memiliki hak akses ke fitur ini.", 403);
  }

  // 6. Validasi integritas profil sesuai role
  if (roleName === "SISWA" && !user.siswaId) {
    throw new AppError("Profil siswa tidak ditemukan pada akun ini.", 400);
  }

  if (roleName === "BK" && !user.counselorId) {
    throw new AppError("Profil Guru BK tidak ditemukan pada akun ini.", 400);
  }

  return {
    user,
    session,
    role: roleName,
    siswaId: user.siswaId,
    counselorId: user.counselorId,
  };
}