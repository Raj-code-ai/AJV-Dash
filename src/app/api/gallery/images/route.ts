import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import GalleryImage from "@/models/GalleryImage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    const filter: Record<string, unknown> = {};
    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) filter.year = y;
    }

    const images = await GalleryImage.find(filter)
      .populate("album", "title year")
      .sort({ year: -1, createdAt: -1 })
      .lean();

    return success(images);
  } catch (err) {
    console.error("GET /api/gallery/images:", err);
    return error("Failed to fetch images", 500);
  }
}
