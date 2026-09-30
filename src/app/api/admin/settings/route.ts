import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { siteSettingsSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const existing = await SiteSettings.findOne().lean();

    if (existing) {
      return success(existing);
    }

    const created = await SiteSettings.create({
      universityName: "University",
      departmentName: "Department",
    });

    return success(created.toObject());
  } catch (err) {
    console.error("GET /api/admin/settings:", err);
    return error("Failed to fetch settings", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireRole(request, "super_admin");
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(siteSettingsSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        universityName: parsed.data.universityName || "University",
        departmentName: parsed.data.departmentName || "Department",
        ...parsed.data,
      });
    } else {
      Object.assign(settings, parsed.data);
      await settings.save();
    }

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "SiteSettings",
      entityId: settings._id.toString(),
      details: "Updated site settings",
      ip: getClientIp(request),
    });

    return success(settings);
  } catch (err) {
    console.error("PUT /api/admin/settings:", err);
    return error("Failed to update settings", 500);
  }
}
