import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { achievementSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const achievements = await Achievement.find()
      .sort({ date: -1 })
      .lean();
    return success(achievements);
  } catch (err) {
    console.error("GET /api/admin/achievements:", err);
    return error("Failed to fetch achievements", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(achievementSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const achievement = await Achievement.create(parsed.data);

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "Achievement",
      entityId: achievement._id.toString(),
      details: `Created achievement: ${achievement.title}`,
      ip: getClientIp(request),
    });

    return success(achievement, 201);
  } catch (err) {
    console.error("POST /api/admin/achievements:", err);
    return error("Failed to create achievement", 500);
  }
}
