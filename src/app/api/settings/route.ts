import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
    console.error("GET /api/settings:", err);
    return error("Failed to fetch settings", 500);
  }
}
