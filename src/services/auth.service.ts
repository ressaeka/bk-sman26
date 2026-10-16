import { sessionService } from "@/services/session.service";
import { userRepository } from "@/repositories/user.repository";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { AppError } from "@/lib/utils/response";

export const authService = {
  async login(username: string, password: string) {
    const user = await userRepository.findByUsername(username);

    if (!user) {
      throw new AppError("Username atau password salah", 401);
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid || !user.isActive) {
      throw new AppError("Username atau password salah", 401);
    }

    const actualRole = user.role.nama_role;

    if (actualRole === "SISWA" && !user.siswa) {
      throw new AppError("Profil siswa tidak ditemukan", 400);
    }
    if (actualRole === "BK" && !user.counselor) {
      throw new AppError("Profil Guru BK tidak ditemukan", 400);
    }

    const session = await sessionService.create(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: actualRole,
        mustChangePassword: user.mustChangePassword,
        siswa: user.siswa,
        counselor: user.counselor,
      },
      session,
    };
  },

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }

    if (!user.isActive) {
      throw new AppError("Akun tidak aktif", 403);
    }

    const isOldPasswordValid = await verifyPassword(oldPassword, user.passwordHash);

    if (!isOldPasswordValid) {
      throw new AppError("Password saat ini salah", 400);
    }

    const isSamePassword = await verifyPassword(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new AppError("Password baru harus berbeda dari password saat ini", 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await userRepository.updatePassword(userId, passwordHash);

    return { success: true };
  },

  async getMe(token: string) {
    const session = await sessionService.validate(token);

    if (!session) {
      throw new AppError("Sesi tidak valid atau telah kedaluwarsa", 401);
    }

    const { user } = session;
    
    return {
      id: user.id,
      username: user.username,
      role: user.role.nama_role,
      mustChangePassword: user.mustChangePassword,
      siswa: user.siswa,
      counselor: user.counselor,
    };
  },

  async logout(token: string) {
    await sessionService.delete(token);
  },
};