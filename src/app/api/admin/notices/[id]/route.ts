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
import { noticeUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Notice from "@/models/Notice";

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
    const notice = await Notice.findById(params.id).lean();
    if (!notice) return error("Notice not found", 404);

    return success(notice);
  } catch (err) {
    console.error("GET /api/admin/notices/[id]:", err);
    return error("Failed to fetch notice", 500);
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
    const parsed = parseBody(noticeUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.expiresAt === null) {
      updateData.expiresAt = undefined;
    }

    const notice = await Notice.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!notice) return error("Notice not found", 404);

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "Notice",
      entityId: notice._id.toString(),
      details: `Updated notice: ${notice.title}`,
      ip: getClientIp(request),
    });

    return success(notice);
  } catch (err) {
    console.error("PUT /api/admin/notices/[id]:", err);
    return error("Failed to update notice", 500);
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
    const notice = await Notice.findByIdAndDelete(params.id);
    if (!notice) return error("Notice not found", 404);

    await logActivity({
      userId: auth.id,
      action: "delete",
      entity: "Notice",
      entityId: params.id,
      details: `Deleted notice: ${notice.title}`,
      ip: getClientIp(request),
    });

    return success({ message: "Notice deleted", id: params.id });
  } catch (err) {
    console.error("DELETE /api/admin/notices/[id]:", err);
    return error("Failed to delete notice", 500);
  }
}
