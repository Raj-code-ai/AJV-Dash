import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import Faculty from "@/models/Faculty";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");

    const filter: Record<string, unknown> = { isActive: true };
    if (featured === "true") filter.isFeatured = true;

    const faculty = await Faculty.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return success(faculty);
  } catch (err) {
    console.error("GET /api/faculty:", err);
    return error("Failed to fetch faculty", 500);
  }
}
