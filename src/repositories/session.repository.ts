import { prisma } from "@/lib/prisma";

export const sessionRepository = {
  create(data: { userId: number; tokenHash: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  },

  findByTokenHash(tokenHash: string) {
    return prisma.session.findUnique({
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
  },

  deleteByTokenHash(tokenHash: string) {
    return prisma.session.delete({
      where: { tokenHash },
    });
  },

  deleteByUserId(userId: number) {
    return prisma.session.deleteMany({
      where: { userId },
    });
  },

  deleteExpired() {
    return prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },

  deleteOtherSessions(userId: number, currentTokenHash: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        tokenHash: { not: currentTokenHash },
      },
    });
  },
};