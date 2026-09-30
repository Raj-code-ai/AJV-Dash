import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import Achievement from "@/models/Achievement";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const filter: Record<string, unknown> = {};

    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) filter.year = y;
    }

    if (category && ["student", "faculty", "department"].includes(category)) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const achievements = await Achievement.find(filter)
      .sort({ date: -1, year: -1 })
      .lean();

    return success(achievements);
  } catch (err) {
    console.error("GET /api/achievements:", err);
    return error("Failed to fetch achievements", 500);
  }
}
