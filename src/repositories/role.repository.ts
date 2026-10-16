import { prisma } from "@/lib/prisma";

export const roleRepository = {
  findByName(namaRole: string) {
    return prisma.role.findUnique({
      where: { 
        nama_role: namaRole 
      },
    });
  },
};