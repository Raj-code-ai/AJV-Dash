import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { galleryImageSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import GalleryImage from "@/models/GalleryImage";
import GalleryAlbum from "@/models/GalleryAlbum";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const album = searchParams.get("album");
    const year = searchParams.get("year");

    const filter: Record<string, unknown> = {};
    if (album) filter.album = album;
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) filter.year = y;
    }

    const images = await GalleryImage.find(filter)
      .populate("album", "title year")
      .sort({ createdAt: -1 })
      .lean();

    return success(images);
  } catch (err) {
    console.error("GET /api/admin/gallery/images:", err);
    return error("Failed to fetch images", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(galleryImageSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const albumExists = await GalleryAlbum.findById(parsed.data.album);
    if (!albumExists) {
      return error("Album not found", 404);
    }

    const image = await GalleryImage.create(parsed.data);

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "GalleryImage",
      entityId: image._id.toString(),
      details: `Added image to album ${albumExists.title}`,
      ip: getClientIp(request),
    });

    return success(image, 201);
  } catch (err) {
    console.error("POST /api/admin/gallery/images:", err);
    return error("Failed to create image", 500);
  }
}
