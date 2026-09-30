import { Document, Model, Schema, models, model } from "mongoose";

export interface ISocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;
}

export interface IStats {
  students: number;
  faculty: number;
  achievements: number;
  placements: number;
}

export interface ISiteSettings extends Document {
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
  socialLinks: ISocialLinks;
  notesPortalUrl: string;
  questionPaperPortalUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  stats: IStats;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    universityName: { type: String, required: true },
    departmentName: { type: String, required: true },
    departmentLogoUrl: { type: String, default: "" },
    universityLogoUrl: { type: String, default: "" },
    departmentDescription: { type: String, default: "" },
    welcomeMessage: { type: String, default: "" },
    hodName: { type: String, default: "" },
    hodDesignation: { type: String, default: "" },
    hodPhotoUrl: { type: String, default: "" },
    hodMessage: { type: String, default: "" },
    aboutHistory: { type: String, default: "" },
    vision: { type: String, default: "" },
    mission: { type: String, default: "" },
    objectives: { type: [String], default: [] },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    officeHours: { type: String, default: "" },
    mapEmbedUrl: { type: String, default: "" },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      instagram: { type: String, default: "" },
    },
    notesPortalUrl: { type: String, default: "" },
    questionPaperPortalUrl: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    heroImageUrl: { type: String, default: "" },
    stats: {
      students: { type: Number, default: 0 },
      faculty: { type: Number, default: 0 },
      achievements: { type: Number, default: 0 },
      placements: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  (models.SiteSettings as Model<ISiteSettings>) ||
  model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
