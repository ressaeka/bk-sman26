import crypto from "crypto";

// 1. Generate token sesi acak 32 bytes (256-bit hex)
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// 2. Hash token menggunakan SHA-256 sebelum disimpan ke database
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}