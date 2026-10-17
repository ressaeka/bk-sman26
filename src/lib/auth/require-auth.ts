// src/lib/auth/require-auth.ts
import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { AUTH_CONSTANTS } from "@/constants/auth.constant";
import { AppError } from "@/lib/utils/response";

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: string[]
) {
  const token = req.cookies.get(AUTH_CONSTANTS.SESSION_COOKIE_NAME)?.value;

  if (!token) {
    throw new AppError("Sesi tidak valid atau telah kedaluwarsa.", 401);
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Hanya select kolom yang benar-benar dibutuhkan (passwordHash TIDAK diikutkan)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      tokenHash: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          username: true,
          isActive: true,
          mustChangePassword: true,
          siswaId: true,
          counselorId: true,
          role: {
            select: {
              nama_role: true,
            },
          },
          siswa: {
            select: {
              id: true,
              nisn: true,
              nama_siswa: true,
              jenis_kelamin: true,
              rombel: true,
              totalPoin: true,     
            },
          },
          counselor: {
            select: {
              id: true,
              nip: true,
              nama_counselor: true,
            },
          },
        },
      },
    },
  });

  // Validasi keaktifan sesi dan user
  if (!session || session.expiresAt < new Date() || !session.user || !session.user.isActive) {
    if (session) {
      // Hapus sesi kedaluwarsa secara otomatis agar tabel session tidak menumpuk
      await prisma.session.delete({ where: { tokenHash } }).catch(() => null);
    }
    throw new AppError("Sesi tidak valid atau telah kedaluwarsa.", 401);
  }

  const user = session.user;
  const roleName = user.role.nama_role;

  // Validasi Role Guard
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(roleName)) {
    throw new AppError("Akses ditolak. Anda tidak memiliki hak akses ke fitur ini.", 403);
  }

  // Validasi profil sesuai role
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