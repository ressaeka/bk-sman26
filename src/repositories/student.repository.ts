import { prisma } from "@/lib/prisma";

export const studentRepository = {
  findById(id: number) {
    return prisma.siswa.findUnique({
      where: { id },
    });
  },

  findByNisn(nisn: string) {
    return prisma.siswa.findUnique({
      where: { nisn },
    });
  },
};