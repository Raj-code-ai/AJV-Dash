import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { facultySchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import Faculty from "@/models/Faculty";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const faculty = await Faculty.find().sort({ order: 1, name: 1 }).lean();
    return success(faculty);
  } catch (err) {
    console.error("GET /api/admin/faculty:", err);
    return error("Failed to fetch faculty", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(facultySchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const faculty = await Faculty.create(parsed.data);

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "Faculty",
      entityId: faculty._id.toString(),
      details: `Created faculty: ${faculty.name}`,
      ip: getClientIp(request),
    });

    return success(faculty, 201);
  } catch (err) {
    console.error("POST /api/admin/faculty:", err);
    return error("Failed to create faculty", 500);
  }
}
