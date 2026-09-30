import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import GalleryAlbum from "@/models/GalleryAlbum";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const albums = await GalleryAlbum.find().sort({ year: -1, title: 1 }).lean();
    return success(albums);
  } catch (err) {
    console.error("GET /api/gallery/albums:", err);
    return error("Failed to fetch albums", 500);
  }
}
