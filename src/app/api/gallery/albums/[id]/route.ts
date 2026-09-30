import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import GalleryAlbum from "@/models/GalleryAlbum";
import GalleryImage from "@/models/GalleryImage";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid album ID", 400);
    }

    const album = await GalleryAlbum.findById(params.id).lean();
    if (!album) {
      return error("Album not found", 404);
    }

    const images = await GalleryImage.find({ album: params.id })
      .sort({ createdAt: -1 })
      .lean();

    return success({ ...album, images });
  } catch (err) {
    console.error("GET /api/gallery/albums/[id]:", err);
    return error("Failed to fetch album", 500);
  }
}
