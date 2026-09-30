import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { userUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import User from "@/models/User";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    await connectDB();
    const user = await User.findById(params.id).select("-password").lean();
    if (!user) return error("User not found", 404);

    return success(user);
  } catch (err) {
    console.error("GET /api/admin/users/[id]:", err);
    return error("Failed to fetch user", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(userUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const user = await User.findById(params.id).select("+password");
    if (!user) return error("User not found", 404);

    // Prevent demoting/disabling the last super_admin
    if (
      user.role === "super_admin" &&
      (parsed.data.role === "admin" || parsed.data.isActive === false)
    ) {
      const superCount = await User.countDocuments({
        role: "super_admin",
        isActive: true,
      });
      if (superCount <= 1) {
        return error("Cannot demote or disable the last super_admin", 403);
      }
    }

    // Only allow promoting to super_admin if none exists (or updating existing)
    if (parsed.data.role === "super_admin" && user.role !== "super_admin") {
      const existingSuper = await User.countDocuments({ role: "super_admin" });
      if (existingSuper > 0) {
        return error("A super_admin already exists", 403);
      }
    }

    if (parsed.data.name !== undefined) user.name = parsed.data.name;
    if (parsed.data.email !== undefined) {
      user.email = parsed.data.email.toLowerCase();
    }
    if (parsed.data.password !== undefined) user.password = parsed.data.password;
    if (parsed.data.role !== undefined) user.role = parsed.data.role;
    if (parsed.data.isActive !== undefined) user.isActive = parsed.data.isActive;

    await user.save();

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "User",
      entityId: user._id.toString(),
      details: `Updated user: ${user.email}`,
      ip: getClientIp(request),
    });

    const safe = user.toObject();
    delete (safe as { password?: string }).password;

    return success(safe);
  } catch (err) {
    console.error("PUT /api/admin/users/[id]:", err);
    return error("Failed to update user", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    // Cannot delete self
    if (params.id === auth.id) {
      return error("Cannot delete your own account", 403);
    }

    await connectDB();
    const user = await User.findById(params.id);
    if (!user) return error("User not found", 404);

    if (user.role === "super_admin") {
      const superCount = await User.countDocuments({ role: "super_admin" });
      if (superCount <= 1) {
        return error("Cannot delete the last super_admin", 403);
      }
    }

    // Soft-disable instead of hard delete by default — disable
    user.isActive = false;
    await user.save();

    await logActivity({
      userId: auth.id,
      action: "disable",
      entity: "User",
      entityId: user._id.toString(),
      details: `Disabled user: ${user.email}`,
      ip: getClientIp(request),
    });

    return success({
      message: "User disabled",
      id: params.id,
      isActive: false,
    });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id]:", err);
    return error("Failed to delete user", 500);
  }
}
