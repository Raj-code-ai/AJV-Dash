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
import { achievementUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    await connectDB();
    const achievement = await Achievement.findById(params.id).lean();
    if (!achievement) return error("Achievement not found", 404);

    return success(achievement);
  } catch (err) {
    console.error("GET /api/admin/achievements/[id]:", err);
    return error("Failed to fetch achievement", 500);
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(achievementUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const achievement = await Achievement.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!achievement) return error("Achievement not found", 404);

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "Achievement",
      entityId: achievement._id.toString(),
      details: `Updated achievement: ${achievement.title}`,
      ip: getClientIp(request),
    });

    return success(achievement);
  } catch (err) {
    console.error("PUT /api/admin/achievements/[id]:", err);
    return error("Failed to update achievement", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid ID", 400);
    }

    await connectDB();
    const achievement = await Achievement.findByIdAndDelete(params.id);
    if (!achievement) return error("Achievement not found", 404);

    await logActivity({
      userId: auth.id,
      action: "delete",
      entity: "Achievement",
      entityId: params.id,
      details: `Deleted achievement: ${achievement.title}`,
      ip: getClientIp(request),
    });

    return success({ message: "Achievement deleted", id: params.id });
  } catch (err) {
    console.error("DELETE /api/admin/achievements/[id]:", err);
    return error("Failed to delete achievement", 500);
  }
}
