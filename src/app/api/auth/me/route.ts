import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error, requireAuth, isErrorResponse } from "@/lib/api";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const user = await User.findById(auth.id)
      .select("-password")
      .lean();

    if (!user) {
      return error("User not found", 404);
    }

    return success({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("GET /api/auth/me:", err);
    return error("Failed to fetch user", 500);
  }
}
