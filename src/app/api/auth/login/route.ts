import { NextRequest } from "next/server";
import { loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { successResponse, handleApiError } from "@/lib/utils/response";
import { setSessionCookie } from "@/lib/utils/cookie"; // Sesuaikan path file cookie helper-mu

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = loginSchema.parse(body);

    const result = await authService.login(username, password);
    const res = successResponse("Login berhasil", { user: result.user });

    // Tempelkan cookie ke response sebelum di-return
    setSessionCookie(res, result.session.token, result.session.expiresAt);

    return res;
  } catch (error) {
    return handleApiError(error);
  }
}