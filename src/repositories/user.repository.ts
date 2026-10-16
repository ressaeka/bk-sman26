import { prisma } from "@/lib/prisma";

export const userRepository = {
  findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        role: true,
        siswa: true,
        counselor: true,
      },
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        siswa: true,
        counselor: true,
      },
    });
  },

  findBySiswaId(siswaId: number) {
    return prisma.user.findUnique({
      where: { siswaId },
      include: {
        role: true,
        siswa: true,
      },
    });
  },

  findByCounselorId(counselorId: number) {
    return prisma.user.findUnique({
      where: { counselorId },
      include: {
        role: true,
        counselor: true,
      },
    });
  },

  create(data: {
    username: string;
    passwordHash: string;
    roleId: number;
    siswaId?: number;
    counselorId?: number;
    isActive?: boolean;
    mustChangePassword?: boolean;
  }) {
    return prisma.user.create({ data });
  },

  updatePassword(userId: number, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });
  },
};