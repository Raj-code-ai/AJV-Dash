import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, AuthUser } from "@/lib/auth";
import type { UserRole } from "@/models/User";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export function success<T>(
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status }
  );
}

export function error(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status }
  );
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthUser | NextResponse> {
  await connectDB();
  const authUser = await getAuthUser(request);

  if (!authUser) {
    return error("Unauthorized", 401);
  }

  const user = await User.findById(authUser.id).select("isActive role email name");
  if (!user || !user.isActive) {
    return error("Unauthorized or account disabled", 401);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

export async function requireRole(
  request: NextRequest,
  roles: UserRole | UserRole[]
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(request);
  if (result instanceof NextResponse) return result;

  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(result.role)) {
    return error("Forbidden: insufficient permissions", 403);
  }

  return result;
}

export function isErrorResponse(
  value: AuthUser | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}

export function getClientIp(request: NextRequest): string | undefined {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    undefined
  );
}
