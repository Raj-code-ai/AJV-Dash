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
import { galleryAlbumUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import GalleryAlbum from "@/models/GalleryAlbum";
import GalleryImage from "@/models/GalleryImage";
import { deleteImage } from "@/lib/cloudinary";

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
    const album = await GalleryAlbum.findById(params.id).lean();
    if (!album) return error("Album not found", 404);

    const images = await GalleryImage.find({ album: params.id }).lean();
    return success({ ...album, images });
  } catch (err) {
    console.error("GET /api/admin/gallery/albums/[id]:", err);
    return error("Failed to fetch album", 500);
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
    const parsed = parseBody(galleryAlbumUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const album = await GalleryAlbum.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!album) return error("Album not found", 404);

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "GalleryAlbum",
      entityId: album._id.toString(),
      details: `Updated album: ${album.title}`,
      ip: getClientIp(request),
    });

    return success(album);
  } catch (err) {
    console.error("PUT /api/admin/gallery/albums/[id]:", err);
    return error("Failed to update album", 500);
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
    const album = await GalleryAlbum.findByIdAndDelete(params.id);
    if (!album) return error("Album not found", 404);

    const images = await GalleryImage.find({ album: params.id });
    for (const img of images) {
      if (img.publicId) await deleteImage(img.publicId);
    }
    await GalleryImage.deleteMany({ album: params.id });

    await logActivity({
      userId: auth.id,
      action: "delete",
      entity: "GalleryAlbum",
      entityId: params.id,
      details: `Deleted album: ${album.title}`,
      ip: getClientIp(request),
    });

    return success({ message: "Album deleted", id: params.id });
  } catch (err) {
    console.error("DELETE /api/admin/gallery/albums/[id]:", err);
    return error("Failed to delete album", 500);
  }
}
