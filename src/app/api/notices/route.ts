import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import Notice from "@/models/Notice";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const notices = await Notice.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
      publishedAt: { $lte: now },
    })
      .sort({ isImportant: -1, publishedAt: -1 })
      .lean();

    return success(notices);
  } catch (err) {
    console.error("GET /api/notices:", err);
    return error("Failed to fetch notices", 500);
  }
}
