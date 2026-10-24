"use client";

import React, { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ClipboardList,
  Calendar,
  Award,
} from "lucide-react";
import { useApiClient, formatErrorMessage } from "@/hooks/useApiClient";

type RoleOption = "SISWA" | "BK";

interface LoginResponseData {
  user: {
    id: number;
    username: string;
    role: RoleOption;
    mustChangePassword?: boolean;
    siswa?: {
      id: number;
      nisn: string;
      nama: string;
      rombel: string;
    } | null;
    counselor?: {
      id: number;
      nip: string;
      nama: string;
    } | null;
  };
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { post } = useApiClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const nextErrors: {
      username?: string;
      password?: string;
    } = {};

    if (!username.trim()) {
      nextErrors.username = "Username wajib diisi.";
    }

    if (!password) {
      nextErrors.password = "Kata sandi wajib diisi.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoading || !validate()) return;

    setIsLoading(true);

    try {
      const response = await post<LoginResponseData>("/api/auth/login", {
        username: username.trim(),
        password,
      });

      const user = response.data?.user;

      // Role harus berasal dari respons server.
      if (!user || (user.role !== "SISWA" && user.role !== "BK")) {
        throw new Error(
          "Informasi akun tidak valid. Silakan hubungi administrator."
        );
      }

      // Redirect default berdasarkan role akun.
      const defaultPath = user.role === "SISWA" ? "/siswa" : "/bk";

      // Redirect hanya diizinkan ke area sesuai role.
      const redirectUrl = searchParams.get("redirect");

      if (
        redirectUrl?.startsWith("/") &&
        !redirectUrl.startsWith("//") &&
        !redirectUrl.includes("\\") &&
        !redirectUrl.includes("\0")
      ) {
        const isSiswaPath =
          redirectUrl === "/siswa" || redirectUrl.startsWith("/siswa/");

        const isBKPath =
          redirectUrl === "/bk" || redirectUrl.startsWith("/bk/");

        if (
          (user.role === "SISWA" && isSiswaPath) ||
          (user.role === "BK" && isBKPath)
        ) {
          router.replace(redirectUrl);
          return;
        }
      }

      router.replace(defaultPath);
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const hasServerError = Boolean(errorMessage);

  return (
    <main className="relative flex min-h-screen w-full flex-col lg:flex-row overflow-x-hidden bg-[#0c377a]">
      {/* ============================================================ */}
      {/* 1. HEADER ATAS (MOBILE) & SISI KIRI (DESKTOP)               */}
      {/* ============================================================ */}
      <section
        aria-label="Informasi Sistem Bimbingan Konseling"
        className="relative flex flex-col justify-between overflow-hidden bg-[#0e3f8a] px-5 pt-8 pb-5 sm:px-8 sm:pt-10 sm:pb-8 lg:min-h-screen lg:w-[48%] xl:w-[46%] lg:py-14 lg:pl-12 lg:pr-20 xl:pl-16 xl:pr-24 shrink-0"
      >
        {/* Foto Gerbang Sekolah sebagai watermark background */}
        <Image
          src="/images/school-building.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          aria-hidden="true"
          className="pointer-events-none object-cover object-center opacity-20 mix-blend-luminosity"
        />

        {/* Overlay biru navy khas SMAN 26 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0c377a]/95 via-[#134fae]/90 to-[#0a2e68]/95"
        />

        {/* --- Logo & Identitas Sekolah --- */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2 shadow-sm">
            <Image
              src="/images/logo-sman26.png"
              alt="Logo SMAN 26 Kabupaten Tangerang"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-[15px] sm:text-base font-bold tracking-tight text-white leading-tight">
              SI-BK
            </h2>
            <p className="text-[11.5px] sm:text-[12px] text-blue-100/80">
              SMAN 26 Kabupaten Tangerang
            </p>
          </div>
        </div>

        {/* --- Headline & Konten Tengah --- */}
        <div className="relative z-10 mt-4 sm:mt-5 lg:my-auto">
          {/* Chip hanya tampil di desktop */}
          <div className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <span
              className="h-2 w-2 rounded-full bg-[#f4c542]"
              aria-hidden="true"
            />
            <span>Bimbingan dan Konseling</span>
          </div>

          {/* Judul: Kompak di mobile, besar di desktop */}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight lg:mt-5 lg:text-[42px] lg:leading-[1.18]">
            Sistem Informasi <br />
            <span className="text-[#f4c542]">Bimbingan dan Konseling</span>
          </h1>

          {/* Subtitle deskripsi hanya tampil di desktop */}
          <p className="hidden lg:block mt-3.5 max-w-md text-sm leading-relaxed text-blue-100/90 sm:text-[15px]">
            Satu tempat untuk siswa dan Guru BK memantau asesmen, layanan konseling, dan perkembangan siswa.
          </p>

          {/* 3 Fitur Utama hanya tampil di desktop */}
          <div className="hidden lg:block mt-8 space-y-4 sm:mt-10 sm:space-y-5">
            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#f4c542] shadow-sm backdrop-blur-sm"
                aria-hidden="true"
              >
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white sm:text-[14.5px]">
                  Asesmen terjadwal
                </h3>
                <p className="mt-0.5 text-xs text-blue-100/75 sm:text-[12.5px]">
                  Dijadwalkan langsung oleh Guru BK
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#f4c542] shadow-sm backdrop-blur-sm"
                aria-hidden="true"
              >
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white sm:text-[14.5px]">
                  Layanan konseling
                </h3>
                <p className="mt-0.5 text-xs text-blue-100/75 sm:text-[12.5px]">
                  Status dan riwayat konseling terpantau
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-[#f4c542] shadow-sm backdrop-blur-sm"
                aria-hidden="true"
              >
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white sm:text-[14.5px]">
                  Pelanggaran & poin
                </h3>
                <p className="mt-0.5 text-xs text-blue-100/75 sm:text-[12.5px]">
                  Catatan perkembangan yang transparan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Hak Cipta Desktop Sisi Kiri --- */}
        <div className="relative z-10 hidden lg:block pt-4">
          <p className="text-xs text-blue-200/60">
            © 2026 SMAN 26 Kabupaten Tangerang
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FORM LOGIN                                                */}
      {/*    Mobile : sheet dengan garis kuning di atas.               */}
      {/*    Desktop: panel putih menimpa panel kiri (-ml-10), sudut   */}
      {/*             kiri melengkung + garis kuning mengikuti lengkung */}
      {/* ============================================================ */}
      <section
        aria-label="Formulir Masuk Akun"
        className="relative z-10 flex flex-1 flex-col justify-between rounded-t-[28px] border-t-4 border-[#f4c542] bg-white px-5 pb-6 pt-6 shadow-2xl sm:rounded-t-[32px] sm:px-8 sm:pb-8 sm:pt-8 lg:-ml-10 lg:min-h-screen lg:rounded-none lg:rounded-l-[40px] lg:border-l-[6px] lg:border-t-0 lg:px-16 lg:py-14 lg:shadow-[-24px_0_48px_-24px_rgba(7,26,58,0.45)] xl:px-24"
      >
        {/* Penyeimbang Vertikal Desktop */}
        <div className="hidden lg:block" />

        {/* Konten Form Tengah */}
        <div className="mx-auto w-full max-w-[420px]">
          {/* Label Selamat Datang (Tampil di Desktop) */}
          <div className="hidden lg:flex mb-2.5 items-center gap-2">
            <span
              className="h-[3.5px] w-6 rounded-full bg-[#f4c542]"
              aria-hidden="true"
            />
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1d4ed8]">
              Selamat Datang
            </span>
          </div>

          {/* Heading Utama */}
          <h2 className="text-2xl font-extrabold tracking-tight text-[#071a3a] sm:text-3xl lg:text-4xl">
            Masuk
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5b6b85] lg:text-[14.5px]">
            Satu pintu masuk untuk Siswa dan Guru BK.
          </p>

          {/* Pesan Kesalahan Server (Sesuai Mockup Mobile State 2) */}
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50/90 p-3.5 text-left text-red-800"
            >
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-[13.5px] font-bold text-red-800">
                  Gagal masuk
                </h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Formulir */}
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4 sm:space-y-4.5">
            {/* Field Username */}
            <div>
              <label
                htmlFor="login-username"
                className="mb-1.5 block text-xs font-semibold text-[#071a3a] sm:text-sm"
              >
                Username
              </label>

              <div className="relative flex items-center">
                <User
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute left-4 text-[#94a3b8]"
                />

                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      username: undefined,
                    }));
                    setErrorMessage(null);
                  }}
                  placeholder="Masukkan username"
                  aria-invalid={Boolean(errors.username || hasServerError)}
                  aria-describedby={
                    errors.username ? "login-username-error" : undefined
                  }
                  className={`h-[52px] w-full rounded-xl border pl-12 pr-4 text-[16px] text-[#071a3a] outline-none transition placeholder:text-[#94a3b8] focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75 ${
                    errors.username || hasServerError
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-[#cbd5e1] bg-white focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/15"
                  }`}
                />
              </div>

              {errors.username && (
                <p
                  id="login-username-error"
                  className="mt-1 text-[11px] font-medium text-red-600"
                >
                  {errors.username}
                </p>
              )}
            </div>

            {/* Field Kata Sandi */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-[#071a3a] sm:text-sm"
              >
                Kata sandi
              </label>

              <div className="relative flex items-center">
                <Lock
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute left-4 text-[#94a3b8]"
                />

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                    setErrorMessage(null);
                  }}
                  placeholder="Masukkan kata sandi"
                  aria-invalid={Boolean(errors.password || hasServerError)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  className={`h-[52px] w-full rounded-xl border pl-12 pr-12 text-[16px] text-[#071a3a] outline-none transition placeholder:text-[#94a3b8] focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75 ${
                    errors.password || hasServerError
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : "border-[#cbd5e1] bg-white focus:border-[#1d4ed8] focus:ring-[#1d4ed8]/15"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#94a3b8] transition hover:text-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showPassword ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="login-password-error"
                  className="mt-1 text-[11px] font-medium text-red-600"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Bantuan Lupa Kata Sandi */}
            <div className="flex justify-end pt-0.5">
              <p className="text-xs text-[#5b6b85]">
                Lupa kata sandi?{" "}
                <span className="font-bold text-[#1d4ed8] transition hover:underline cursor-pointer">
                  Hubungi Guru BK
                </span>
              </p>
            </div>

            {/* Tombol Masuk (Tinggi 52px, teks 16px font-bold) */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className={`mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[16px] font-bold text-white shadow-md shadow-blue-700/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d4ed8] focus-visible:ring-offset-2 disabled:cursor-not-allowed ${
                isLoading
                  ? "bg-[#336ec9] opacity-90"
                  : "bg-[#1d4ed8] hover:bg-[#1742c0] active:scale-[0.99]"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin text-white"
                    aria-hidden="true"
                  />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight size={19} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Bawah */}
        <footer className="mt-8 text-center sm:text-right">
          <p className="text-[11.5px] sm:text-[12px] font-medium text-[#94a3b8]">
            SMAN 26 Kabupaten Tangerang · Bimbingan Konseling
          </p>
        </footer>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen w-full items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={30}
              className="animate-spin text-[#1d4ed8]"
              aria-hidden="true"
            />
            <p className="text-xs font-medium text-[#64748b]">
              Memuat halaman login...
            </p>
          </div>
        </main>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}