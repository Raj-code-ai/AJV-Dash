import { Document, Model, Schema, models, model } from "mongoose";

export type AchievementCategory = "student" | "faculty" | "department";

export interface IAchievement extends Document {
  title: string;
  description: string;
  date: Date;
  category: AchievementCategory;
  imageUrl?: string;
  certificateUrl?: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      enum: ["student", "faculty", "department"],
      required: true,
    },
    imageUrl: { type: String },
    certificateUrl: { type: String },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

AchievementSchema.index({ year: -1, category: 1 });
AchievementSchema.index({ title: "text", description: "text" });

const Achievement: Model<IAchievement> =
  (models.Achievement as Model<IAchievement>) ||
  model<IAchievement>("Achievement", AchievementSchema);

export default Achievement;
