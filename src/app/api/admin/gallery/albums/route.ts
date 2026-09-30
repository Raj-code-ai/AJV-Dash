import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { galleryAlbumSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import GalleryAlbum from "@/models/GalleryAlbum";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const albums = await GalleryAlbum.find().sort({ year: -1 }).lean();
    return success(albums);
  } catch (err) {
    console.error("GET /api/admin/gallery/albums:", err);
    return error("Failed to fetch albums", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    await connectDB();
    const body = await request.json();
    const parsed = parseBody(galleryAlbumSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const album = await GalleryAlbum.create(parsed.data);

    await logActivity({
      userId: auth.id,
      action: "create",
      entity: "GalleryAlbum",
      entityId: album._id.toString(),
      details: `Created album: ${album.title}`,
      ip: getClientIp(request),
    });

    return success(album, 201);
  } catch (err) {
    console.error("POST /api/admin/gallery/albums:", err);
    return error("Failed to create album", 500);
  }
}
