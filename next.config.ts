import type { NextConfig } from "next";

const securityHeaders = [
  // 1. Mencegah Clickjacking (Website tidak bisa di-embed di iframe sembarangan)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // 2. Mencegah MIME Type Sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 3. Mengontrol informasi referrer ke domain luar
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 4. Membatasi akses sensor / hardware browser yang tidak dibutuhkan
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // 5. Memaksa koneksi HTTPS secara persisten
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // 6. Proteksi XSS filter untuk browser lama
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // Matikan header "X-Powered-By: Next.js"
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;