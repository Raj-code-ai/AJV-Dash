import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { error, getClientIp } from "@/lib/api";
import { loginSchema, parseBody } from "@/lib/validations";
import { signToken, TOKEN_COOKIE_OPTIONS } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = parseBody(loginSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user || !user.isActive) {
      return error("Invalid email or password", 401);
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return error("Invalid email or password", 401);
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await logActivity({
      userId: user._id,
      action: "login",
      entity: "User",
      entityId: user._id.toString(),
      details: `User ${user.email} logged in`,
      ip: getClientIp(request),
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("token", token, TOKEN_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error("POST /api/auth/login:", err);
    return error("Login failed", 500);
  }
}
