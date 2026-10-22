
"use client";

import { useCallback } from "react";

export class ApiError extends Error {
  statusCode: number;
  retryAfter?: string;

  constructor(
    message: string,
    statusCode: number,
    retryAfter?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  retryAfter?: string;
  [key: string]: unknown;
}

export function formatErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.statusCode === 429 && err.retryAfter) {
      return `${err.message} (Coba lagi dalam ${err.retryAfter})`;
    }

    return err.message;
  }

  if (err instanceof Error) {
    if (err.name === "AbortError") {
      return "Permintaan dibatalkan. Silakan coba lagi.";
    }

    return err.message;
  }

  return "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
}

export function useApiClient() {
  const request = useCallback(
    async <T = unknown>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<{
      success: boolean;
      message: string;
      data?: T;
      [key: string]: unknown;
    }> => {
      const headers = new Headers(options.headers || {});

      if (
        !headers.has("Content-Type") &&
        options.body !== undefined &&
        options.body !== null &&
        typeof options.body === "string"
      ) {
        headers.set("Content-Type", "application/json");
      }

      let response: Response;

      try {
        response = await fetch(endpoint, {
          ...options,
          headers,
          credentials: "include",
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }

        throw new ApiError(
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
          0
        );
      }

      let result: ApiResponse;

      try {
        result = (await response.json()) as ApiResponse;
      } catch {
        result = {
          success: response.ok,
          message: response.ok
            ? "Permintaan berhasil."
            : response.statusText || "Terjadi kesalahan pada server.",
        };
      }

      if (!response.ok) {
        const message =
          typeof result.message === "string"
            ? result.message
            : "Gagal memproses permintaan.";

        throw new ApiError(
          message,
          response.status,
          typeof result.retryAfter === "string"
            ? result.retryAfter
            : undefined
        );
      }

      return result as {
        success: boolean;
        message: string;
        data?: T;
        [key: string]: unknown;
      };
    },
    []
  );

  const get = useCallback(
    <T = unknown>(
      endpoint: string,
      options: RequestInit = {}
    ) => request<T>(endpoint, { ...options, method: "GET" }),
    [request]
  );

  const post = useCallback(
    <T = unknown>(
      endpoint: string,
      body?: unknown,
      options: RequestInit = {}
    ) =>
      request<T>(endpoint, {
        ...options,
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      }),
    [request]
  );

  const patch = useCallback(
    <T = unknown>(
      endpoint: string,
      body?: unknown,
      options: RequestInit = {}
    ) =>
      request<T>(endpoint, {
        ...options,
        method: "PATCH",
        body: body === undefined ? undefined : JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      }),
    [request]
  );

  const del = useCallback(
    <T = unknown>(
      endpoint: string,
      options: RequestInit = {}
    ) => request<T>(endpoint, { ...options, method: "DELETE" }),
    [request]
  );

  return {
    request,
    get,
    post,
    patch,
    del,
  };
}
