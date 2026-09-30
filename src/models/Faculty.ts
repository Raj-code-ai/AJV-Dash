import { Document, Model, Schema, models, model } from "mongoose";

export interface IFaculty extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true, default: "" },
    githubUrl: { type: String, trim: true, default: "" },
    photoUrl: { type: String, required: true },
    researchInterests: { type: [String], default: [] },
    bio: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FacultySchema.index({ order: 1, name: 1 });

const Faculty: Model<IFaculty> =
  (models.Faculty as Model<IFaculty>) ||
  model<IFaculty>("Faculty", FacultySchema);

export default Faculty;
