import { successResponse } from "@/lib/utils/response";

export async function GET() {
  return successResponse("Server BK-26 berjalan dengan baik", {
    name: "BK-26 API Server",
    status: "UP",
    timestamp: new Date().toISOString(),
  });
}
