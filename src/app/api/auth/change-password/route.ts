import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { changePasswordSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import { sessionService } from "@/services/session.service";
import { successResponse, handleApiError } from "@/lib/utils/response";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    const body = await req.json();
    const data = changePasswordSchema.parse(body);

    await authService.changePassword(auth.user.id, data.oldPassword, data.newPassword);

    // Invalidate sesi di perangkat lain demi keamanan setelah ganti password
    await sessionService.deleteOtherSessionsByHash(auth.user.id, auth.session.tokenHash);
    
    return successResponse("Password berhasil diubah");
  } catch (error) {
    return handleApiError(error);
  }
}