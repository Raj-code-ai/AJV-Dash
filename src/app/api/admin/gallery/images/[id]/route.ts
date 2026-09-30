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
import { galleryImageUpdateSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import { deleteImage } from "@/lib/cloudinary";
import GalleryImage from "@/models/GalleryImage";

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
    const image = await GalleryImage.findById(params.id)
      .populate("album", "title year")
      .lean();
    if (!image) return error("Image not found", 404);

    return success(image);
  } catch (err) {
    console.error("GET /api/admin/gallery/images/[id]:", err);
    return error("Failed to fetch image", 500);
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
    const parsed = parseBody(galleryImageUpdateSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const image = await GalleryImage.findByIdAndUpdate(
      params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!image) return error("Image not found", 404);

    await logActivity({
      userId: auth.id,
      action: "update",
      entity: "GalleryImage",
      entityId: image._id.toString(),
      details: `Updated gallery image`,
      ip: getClientIp(request),
    });

    return success(image);
  } catch (err) {
    console.error("PUT /api/admin/gallery/images/[id]:", err);
    return error("Failed to update image", 500);
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
    const image = await GalleryImage.findByIdAndDelete(params.id);
    if (!image) return error("Image not found", 404);

    if (image.publicId) {
      await deleteImage(image.publicId);
    }

    await logActivity({
      userId: auth.id,
      action: "delete",
      entity: "GalleryImage",
      entityId: params.id,
      details: `Deleted gallery image`,
      ip: getClientIp(request),
    });

    return success({ message: "Image deleted", id: params.id });
  } catch (err) {
    console.error("DELETE /api/admin/gallery/images/[id]:", err);
    return error("Failed to delete image", 500);
  }
}
