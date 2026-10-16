import { NextRequest } from "next/server";
import { authService } from "@/services/auth.service";
import { AUTH_CONSTANTS } from "@/constants/auth.constant";
import { clearSessionCookie } from "@/lib/utils/cookie";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_CONSTANTS.SESSION_COOKIE_NAME)?.value;
    if (token) {
      await authService.logout(token);
    }

    const res = successResponse("Logout berhasil");
    clearSessionCookie(res);
    return res;
  } catch (error) {
    return handleApiError(error);
  }
}