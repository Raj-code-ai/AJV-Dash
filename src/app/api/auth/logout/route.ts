import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getClientIp } from "@/lib/api";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(request);

    if (user) {
      await logActivity({
        userId: user.id,
        action: "logout",
        entity: "User",
        entityId: user.id,
        details: `User ${user.email} logged out`,
        ip: getClientIp(request),
      });
    }

    const response = NextResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/logout:", err);
    const response = NextResponse.json({
      success: true,
      data: { message: "Logged out" },
    });
    response.cookies.set("token", "", { path: "/", maxAge: 0 });
    return response;
  }
}
