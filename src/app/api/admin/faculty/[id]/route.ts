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
import { facultyUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Faculty from "@/models/Faculty";

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
    const faculty = await Faculty.findById(params.id).lean();
    if (!faculty) return error("Faculty not found", 404);

    return success(faculty);
  } catch (err) {
    console.error("GET /api/admin/faculty/[id]:", err);
    return error("Failed to fetch faculty", 500);
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
    const parsed = parseBody(facultyUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const faculty = await Faculty.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!faculty) return error("Faculty not found", 404);

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "Faculty",
      entityId: faculty._id.toString(),
      details: `Updated faculty: ${faculty.name}`,
      ip: getClientIp(request),
    });

    return success(faculty);
  } catch (err) {
    console.error("PUT /api/admin/faculty/[id]:", err);
    return error("Failed to update faculty", 500);
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
    const faculty = await Faculty.findByIdAndDelete(params.id);
    if (!faculty) return error("Faculty not found", 404);

    await logActivity({
      userId: auth.id,
      action: "delete",
      entity: "Faculty",
      entityId: params.id,
      details: `Deleted faculty: ${faculty.name}`,
      ip: getClientIp(request),
    });

    return success({ message: "Faculty deleted", id: params.id });
  } catch (err) {
    console.error("DELETE /api/admin/faculty/[id]:", err);
    return error("Failed to delete faculty", 500);
  }
}
