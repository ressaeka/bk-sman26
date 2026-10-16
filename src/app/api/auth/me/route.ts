import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);

    return successResponse("Session valid", {
      user: {
        id: auth.user.id,
        username: auth.user.username,
        role: auth.role,
        mustChangePassword: auth.user.mustChangePassword,
        siswa: auth.user.siswa,
        counselor: auth.user.counselor,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}