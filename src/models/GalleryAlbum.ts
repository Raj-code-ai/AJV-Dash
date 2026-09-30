import { Document, Model, Schema, models, model } from "mongoose";

export interface IGalleryAlbum extends Document {
  title: string;
  description?: string;
  year: number;
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryAlbumSchema = new Schema<IGalleryAlbum>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    year: { type: Number, required: true },
    coverImageUrl: { type: String },
  },
  { timestamps: true }
);

GalleryAlbumSchema.index({ year: -1 });

const GalleryAlbum: Model<IGalleryAlbum> =
  (models.GalleryAlbum as Model<IGalleryAlbum>) ||
  model<IGalleryAlbum>("GalleryAlbum", GalleryAlbumSchema);

export default GalleryAlbum;
