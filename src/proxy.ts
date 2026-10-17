import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Kuota 1: Rute Auth (5x per menit)
const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// Kuota 2: Rute Submit Siswa (15x per menit)
const submissionRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
  prefix: "ratelimit:submission",
});

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewatin kalo token Upstash di .env belum diset
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.next();
  }

  // Tangkap IP client
  const ip =
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "127.0.0.1";

  // Pilih limiter berdasarkan endpoint yang masuk matcher
  const isAuth =
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/change-password");

  const limiter = isAuth ? authRateLimiter : submissionRateLimiter;
  const identifier = `${ip}:${isAuth ? "auth" : "submission"}`;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));

      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Terlalu banyak permintaan. Silakan tunggu beberapa saat.",
          retryAfter: `${retryAfterSeconds} detik`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    response.headers.set("X-RateLimit-Reset", String(reset));

    return response;
  } catch (error) {
    console.error("Rate limiter warning:", error);
    return NextResponse.next();
  }
}

// DAFTAR MATCHER: Cuma cegat endpoint yang rawan brute-force & spam
export const config = {
  matcher: [
    // 1. Endpoint Auth
    "/api/auth/login",
    "/api/auth/change-password",

    // 2. Endpoint Submit Asesmen Siswa
    "/api/siswa/assessment/:path*/submit",

    // 3. Endpoint Pengajuan Konseling Siswa
    "/api/siswa/konseling",
  ],
};