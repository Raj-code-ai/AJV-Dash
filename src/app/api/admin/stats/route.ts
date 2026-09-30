import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
} from "@/lib/api";
import Faculty from "@/models/Faculty";
import Achievement from "@/models/Achievement";
import GalleryImage from "@/models/GalleryImage";
import Notice from "@/models/Notice";
import User from "@/models/User";
import GalleryAlbum from "@/models/GalleryAlbum";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();

    const [
      faculty,
      achievements,
      galleryImages,
      notices,
      admins,
      albums,
      activeNotices,
    ] = await Promise.all([
      Faculty.countDocuments(),
      Achievement.countDocuments(),
      GalleryImage.countDocuments(),
      Notice.countDocuments(),
      User.countDocuments({ role: { $in: ["admin", "super_admin"] } }),
      GalleryAlbum.countDocuments(),
      Notice.countDocuments({ isActive: true }),
    ]);

    return success({
      faculty,
      achievements,
      galleryImages,
      notices,
      activeNotices,
      admins,
      albums,
    });
  } catch (err) {
    console.error("GET /api/admin/stats:", err);
    return error("Failed to fetch stats", 500);
  }
}
