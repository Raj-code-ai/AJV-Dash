import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { noticeSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Notice from "@/models/Notice";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const notices = await Notice.find()
      .sort({ publishedAt: -1 })
      .lean();
    return success(notices);
  } catch (err) {
    console.error("GET /api/admin/notices:", err);
    return error("Failed to fetch notices", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(noticeSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const notice = await Notice.create({
      ...parsed.data,
      publishedAt: parsed.data.publishedAt || new Date(),
    });

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "Notice",
      entityId: notice._id.toString(),
      details: `Created notice: ${notice.title}`,
      ip: getClientIp(request),
    });

    return success(notice, 201);
  } catch (err) {
    console.error("POST /api/admin/notices:", err);
    return error("Failed to create notice", 500);
  }
}
