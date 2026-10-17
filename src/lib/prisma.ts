import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // KUNCI SERVERLESS: Batasi 1 koneksi per instance fungsi serverless
  connectionLimit: 1,
  acquireTimeout: 10000, // Timeout antrian koneksi maksimal 10 detik
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Simpan selalu ke globalThis agar container serverless yang "warm" me-reuse instance yang sama
globalForPrisma.prisma = prisma;