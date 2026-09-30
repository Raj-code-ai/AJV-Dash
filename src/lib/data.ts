import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Faculty from "@/models/Faculty";
import Achievement from "@/models/Achievement";
import Notice from "@/models/Notice";
import GalleryAlbum from "@/models/GalleryAlbum";
import GalleryImage from "@/models/GalleryImage";
import type {
  Achievement as AchievementT,
  AchievementCategory,
  Faculty as FacultyT,
  GalleryAlbum as GalleryAlbumT,
  GalleryImage as GalleryImageT,
  Notice as NoticeT,
  SiteSettings as SiteSettingsT,
} from "@/types";

/** Serialize mongoose lean docs for Next.js (ObjectId/Date → plain JSON). */
function serialize<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getSettings(): Promise<SiteSettingsT | null> {
  try {
    await connectDB();
    const existing = await SiteSettings.findOne().lean();
    if (existing) {
      return serialize<SiteSettingsT>(existing);
    }

    const created = await SiteSettings.create({
      universityName: "University",
      departmentName: "Department",
    });
    return serialize<SiteSettingsT>(created.toObject());
  } catch (err) {
    console.error("getSettings:", err);
    return null;
  }
}

export async function getFaculty(options?: {
  featured?: boolean;
}): Promise<FacultyT[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> = { isActive: true };
    if (options?.featured) filter.isFeatured = true;
    const rows = await Faculty.find(filter).sort({ order: 1, name: 1 }).lean();
    return serialize<FacultyT[]>(rows);
  } catch (err) {
    console.error("getFaculty:", err);
    return [];
  }
}

export async function getFacultyById(id: string): Promise<FacultyT | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectDB();
    const row = await Faculty.findOne({ _id: id, isActive: true }).lean();
    return row ? serialize<FacultyT>(row) : null;
  } catch (err) {
    console.error("getFacultyById:", err);
    return null;
  }
}

export async function getAchievements(filters?: {
  year?: string;
  category?: string;
  q?: string;
}): Promise<AchievementT[]> {
  try {
    await connectDB();
    const filter: Record<string, unknown> = {};

    if (filters?.year) {
      const y = parseInt(filters.year, 10);
      if (!Number.isNaN(y)) filter.year = y;
    }
    if (
      filters?.category &&
      ["student", "faculty", "department"].includes(filters.category)
    ) {
      filter.category = filters.category as AchievementCategory;
    }
    if (filters?.q) {
      filter.$or = [
        { title: { $regex: filters.q, $options: "i" } },
        { description: { $regex: filters.q, $options: "i" } },
      ];
    }

    const rows = await Achievement.find(filter)
      .sort({ date: -1, year: -1 })
      .lean();
    return serialize<AchievementT[]>(rows);
  } catch (err) {
    console.error("getAchievements:", err);
    return [];
  }
}

export async function getNotices(): Promise<NoticeT[]> {
  try {
    await connectDB();
    const now = new Date();
    const rows = await Notice.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
      publishedAt: { $lte: now },
    })
      .sort({ isImportant: -1, publishedAt: -1 })
      .lean();
    return serialize<NoticeT[]>(rows);
  } catch (err) {
    console.error("getNotices:", err);
    return [];
  }
}

export async function getAlbums(): Promise<GalleryAlbumT[]> {
  try {
    await connectDB();
    const rows = await GalleryAlbum.find().sort({ year: -1, title: 1 }).lean();
    return serialize<GalleryAlbumT[]>(rows);
  } catch (err) {
    console.error("getAlbums:", err);
    return [];
  }
}

export async function getAlbumById(
  id: string
): Promise<(GalleryAlbumT & { images: GalleryImageT[] }) | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await connectDB();
    const album = await GalleryAlbum.findById(id).lean();
    if (!album) return null;
    const images = await GalleryImage.find({ album: id })
      .sort({ createdAt: -1 })
      .lean();
    return serialize<GalleryAlbumT & { images: GalleryImageT[] }>({
      ...album,
      images,
    });
  } catch (err) {
    console.error("getAlbumById:", err);
    return null;
  }
}
