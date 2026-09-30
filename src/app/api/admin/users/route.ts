import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { userCreateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return success(users);
  } catch (err) {
    console.error("GET /api/admin/users:", err);
    return error("Failed to fetch users", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(userCreateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    let role = parsed.data.role || "admin";

    // Only allow creating another super_admin if none exists
    if (role === "super_admin") {
      const existingSuper = await User.countDocuments({ role: "super_admin" });
      if (existingSuper > 0) {
        return error(
          "Cannot create another super_admin. Only create role=admin.",
          403
        );
      }
    }

    // Default: create as admin
    if (role !== "super_admin") {
      role = "admin";
    }

    const existing = await User.findOne({
      email: parsed.data.email.toLowerCase(),
    });
    if (existing) {
      return error("A user with this email already exists", 409);
    }

    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      role,
      isActive: parsed.data.isActive ?? true,
    });

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "User",
      entityId: user._id.toString(),
      details: `Created user: ${user.email} (${user.role})`,
      ip: getClientIp(request),
    });

    const safe = user.toObject();
    delete (safe as { password?: string }).password;

    return success(safe, 201);
  } catch (err) {
    console.error("POST /api/admin/users:", err);
    return error("Failed to create user", 500);
  }
}
