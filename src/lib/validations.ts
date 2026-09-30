import { z } from "zod";

/** Accepts https URLs or local uploaded paths like /uploads/... */
const mediaPath = (
  requiredMessage = "Valid image URL or uploaded path required"
) =>
  z.string().refine(
    (v) =>
      v === "" || v.startsWith("/uploads/") || /^https?:\/\//i.test(v),
    { message: requiredMessage }
  );

const optionalMediaPath = mediaPath().optional().or(z.literal(""));

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "super_admin"]).default("admin"),
  isActive: z.boolean().optional().default(true),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "super_admin"]).optional(),
  isActive: z.boolean().optional(),
});

export const facultySchema = z.object({
  name: z.string().min(2, "Name is required"),
  designation: z.string().min(2, "Designation is required"),
  qualification: z.string().min(2, "Qualification is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().or(z.literal("")),
  linkedinUrl: optionalMediaPath,
  githubUrl: optionalMediaPath,
  photoUrl: mediaPath("Valid photo URL or uploaded path required"),
  researchInterests: z.array(z.string()).default([]),
  bio: z.string().min(10, "Bio is required"),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const facultyUpdateSchema = facultySchema.partial();

export const achievementSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(5, "Description is required"),
  date: z.coerce.date(),
  category: z.enum(["student", "faculty", "department"]),
  imageUrl: optionalMediaPath,
  certificateUrl: optionalMediaPath,
  year: z.number().int().min(1900).max(2100),
});

export const achievementUpdateSchema = achievementSchema.partial();

export const galleryAlbumSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  year: z.number().int().min(1900).max(2100),
  coverImageUrl: optionalMediaPath,
});

export const galleryAlbumUpdateSchema = galleryAlbumSchema.partial();

export const galleryImageSchema = z.object({
  album: z.string().min(1, "Album ID is required"),
  title: z.string().optional().or(z.literal("")),
  imageUrl: mediaPath("Valid image URL or uploaded path required"),
  publicId: z.string().optional().or(z.literal("")),
  year: z.number().int().min(1900).max(2100),
});

export const galleryImageUpdateSchema = galleryImageSchema.partial();

export const noticeSchema = z.object({
  title: z.string().min(2, "Title is required"),
  content: z.string().min(5, "Content is required"),
  isImportant: z.boolean().optional().default(false),
  pdfUrl: optionalMediaPath,
  publishedAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const noticeUpdateSchema = noticeSchema.partial();

export const socialLinksSchema = z.object({
  facebook: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  youtube: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
});

export const statsSchema = z.object({
  students: z.number().int().min(0).optional(),
  faculty: z.number().int().min(0).optional(),
  achievements: z.number().int().min(0).optional(),
  placements: z.number().int().min(0).optional(),
});

export const siteSettingsSchema = z.object({
  universityName: z.string().min(2).optional(),
  departmentName: z.string().min(2).optional(),
  departmentLogoUrl: z.string().optional().or(z.literal("")),
  universityLogoUrl: z.string().optional().or(z.literal("")),
  departmentDescription: z.string().optional(),
  welcomeMessage: z.string().optional(),
  hodName: z.string().optional(),
  hodDesignation: z.string().optional(),
  hodPhotoUrl: z.string().optional().or(z.literal("")),
  hodMessage: z.string().optional(),
  aboutHistory: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  officeHours: z.string().optional(),
  mapEmbedUrl: z.string().optional().or(z.literal("")),
  socialLinks: socialLinksSchema.optional(),
  notesPortalUrl: z.string().optional().or(z.literal("")),
  questionPaperPortalUrl: z.string().optional().or(z.literal("")),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().optional().or(z.literal("")),
  stats: statsSchema.optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  phone: z.string().optional(),
});

export const uploadBase64Schema = z.object({
  image: z.string().min(1, "Image data is required"),
  folder: z.string().optional(),
  mimeType: z.string().optional(),
});

export function parseBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; error: string; details: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || "Validation failed",
      details: result.error.errors,
    };
  }
  return { success: true, data: result.data };
}
