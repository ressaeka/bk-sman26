
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
      nextErrors.password = "Password wajib diisi.";
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
      const response = await post<LoginResponseData>(
        "/api/auth/login",
        {
          username: username.trim(),
          password,
        }
      );

      const user = response.data?.user;

      // Role harus berasal dari respons server.
      if (
        !user ||
        (user.role !== "SISWA" && user.role !== "BK")
      ) {
        throw new Error(
          "Informasi akun tidak valid. Silakan hubungi administrator."
        );
      }

      // Siswa langsung menuju dashboard.
      // Guru BK menuju dashboard BK.
      const defaultPath =
        user.role === "SISWA" ? "/siswa" : "/bk";

      // Redirect hanya boleh menuju halaman sesuai role.
      const redirectUrl = searchParams.get("redirect");

      if (
        redirectUrl?.startsWith("/") &&
        !redirectUrl.startsWith("//") &&
        !redirectUrl.includes("\\") &&
        !redirectUrl.includes("\0")
      ) {
        const isSiswaPath =
          redirectUrl === "/siswa" ||
          redirectUrl.startsWith("/siswa/");

        const isBKPath =
          redirectUrl === "/bk" ||
          redirectUrl.startsWith("/bk/");

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

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-4 py-8 sm:px-6">
      {/* Foto sekolah */}
      <Image
        src="/images/school-building.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        aria-hidden="true"
        className="pointer-events-none object-cover object-center"
      />

      {/* Overlay putih */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-white/65 backdrop-blur-[2px]"
      />

      {/* Panel login */}
      <section
        aria-label="Formulir login Sistem Bimbingan Konseling"
        className="relative z-10 w-full max-w-[440px] rounded-2xl border border-white/80 bg-white/95 px-6 py-8 shadow-[0_20px_60px_rgba(15,35,65,0.18)] backdrop-blur-md sm:rounded-[22px] sm:px-9 sm:py-10"
      >
        {/* Logo sekolah */}
        <div className="mb-3.5 flex justify-center">
          <div className="relative h-[76px] w-[76px] transition-transform duration-300 hover:scale-105 sm:h-[84px] sm:w-[84px]">
            <Image
              src="/images/logo-sman26.png"
              alt="Logo SMAN 26 Kabupaten Tangerang"
              width={84}
              height={84}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Judul */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#143b70] sm:text-[26px]">
            Login
          </h1>

          <p className="mx-auto mt-1.5 max-w-[290px] text-xs leading-relaxed text-[#64748b] sm:text-[13px]">
            Sistem Informasi Bimbingan dan Konseling
          </p>
        </header>

        {/* Pesan kesalahan */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-700"
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-600"
              aria-hidden="true"
            />
            <span className="flex-1 font-medium">
              {errorMessage}
            </span>
          </div>
        )}

        {/* Form login */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="login-username"
              className="mb-1.5 block text-xs font-semibold text-[#1e293b]"
            >
              Username
            </label>

            <div className="relative flex items-center">
              <User
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute left-3.5 text-[#94a3b8]"
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
                aria-invalid={Boolean(errors.username)}
                aria-describedby={
                  errors.username
                    ? "login-username-error"
                    : undefined
                }
                className={`h-[46px] w-full rounded-lg border bg-white pl-10 pr-3.5 text-sm text-[#0f2847] outline-none transition placeholder:text-[#94a3b8] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.username
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-[#d8e2ec] focus:border-[#185bc3] focus:ring-[#185bc3]/15"
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

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-xs font-semibold text-[#1e293b]"
            >
              Password
            </label>

            <div className="relative flex items-center">
              <Lock
                aria-hidden="true"
                size={18}
                className="pointer-events-none absolute left-3.5 text-[#94a3b8]"
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
                placeholder="Masukkan password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password
                    ? "login-password-error"
                    : undefined
                }
                className={`h-[46px] w-full rounded-lg border bg-white pl-10 pr-11 text-sm text-[#0f2847] outline-none transition placeholder:text-[#94a3b8] focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.password
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : "border-[#d8e2ec] focus:border-[#185bc3] focus:ring-[#185bc3]/15"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLoading}
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                className="absolute right-3.5 rounded p-1 text-[#94a3b8] transition hover:text-[#185bc3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185bc3] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
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

          {/* Tombol login */}
          <button
            type="submit"
            id="btn-login-submit"
            disabled={isLoading}
            className="mt-2 flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#185bc3] text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#144ea8] active:scale-[0.99] active:bg-[#0f3d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185bc3] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <ArrowRight size={18} aria-hidden="true" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <footer className="mt-8 border-t border-[#e2e8f0] pt-5 text-center">
          <p className="text-[11px] font-medium text-[#94a3b8]">
            SMAN 26 Kabupaten Tangerang
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            Bimbingan Konseling
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
              className="animate-spin text-[#185bc3]"
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
