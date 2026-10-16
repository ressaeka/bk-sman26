import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
  }
}

export function successResponse(message: string, data?: unknown, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function paginatedResponse(
  message: string,
  Metadata: unknown[],
  total: number,
  page: number,
  limit: number,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      Metadata,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status }
  );
}

// Cukup ambil query param murni (page, limit, sortOrder) untuk diteruskan ke Service/Repository
export function getPaginationParams(url: URL, defaultLimit = 10) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit")) || defaultLimit));
  const sortOrder = (url.searchParams.get("sortOrder")?.toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc";

  return { page, limit, sortOrder };
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]?.message || "Input data tidak valid";
    return NextResponse.json({ success: false, message: firstIssue }, { status: 400 });
  }

  console.error("[API_FATAL_ERROR]:", error);
  return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
}