import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import Faculty from "@/models/Faculty";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return error("Invalid faculty ID", 400);
    }

    const faculty = await Faculty.findOne({
      _id: params.id,
      isActive: true,
    }).lean();

    if (!faculty) {
      return error("Faculty not found", 404);
    }

    return success(faculty);
  } catch (err) {
    console.error("GET /api/faculty/[id]:", err);
    return error("Failed to fetch faculty member", 500);
  }
}
