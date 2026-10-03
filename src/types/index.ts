export type UserRole = "super_admin" | "admin";
export type AchievementCategory = "student" | "faculty" | "department";

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
}

export interface SiteStats {
  students: number;
  faculty: number;
  achievements: number;
  placements: number;
}

export interface SiteSettings {
  _id: string;
  universityName: string;
  departmentName: string;
  departmentLogoUrl: string;
  universityLogoUrl: string;
  departmentDescription: string;
  welcomeMessage: string;
  hodName: string;
  hodDesignation: string;
  hodPhotoUrl: string;
  hodMessage: string;
  aboutHistory: string;
  vision: string;
  mission: string;
  objectives: string[];
  address: string;
  email: string;
  phone: string;
  officeHours: string;
  mapEmbedUrl: string;
  socialLinks: SocialLinks;
  notesPortalUrl: string;
  questionPaperPortalUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  stats: SiteStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface Faculty {
  _id: string;
  name: string;
  designation: string;
  qualification: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  photoUrl: string;
  researchInterests: string[];
  bio: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  date: string;
  category: AchievementCategory;
  imageUrl?: string;
  certificateUrl?: string;
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  isImportant: boolean;
  pdfUrl?: string;
  publishedAt: string;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryAlbum {
  _id: string;
  title: string;
  description?: string;
  year: number;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImage {
  _id: string;
  album: string | { _id: string; title: string; year: number };
  title?: string;
  imageUrl: string;
  publicId?: string;
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryAlbumDetail extends GalleryAlbum {
  images: GalleryImage[];
}

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export interface AdminStats {
  faculty: number;
  achievements: number;
  galleryImages: number;
  notices: number;
  activeNotices: number;
  admins: number;
  albums: number;
  totalVisits: number;
  uniqueVisitors: number;
}

export interface ActivityLog {
  _id: string;
  user?: { _id: string; name: string; email: string; role: UserRole } | string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}
