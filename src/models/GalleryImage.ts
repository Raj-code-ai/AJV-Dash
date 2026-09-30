import { Document, Model, Schema, Types, models, model } from "mongoose";

export interface IGalleryImage extends Document {
  album: Types.ObjectId;
  title?: string;
  imageUrl: string;
  publicId?: string;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    album: {
      type: Schema.Types.ObjectId,
      ref: "GalleryAlbum",
      required: true,
    },
    title: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    year: { type: Number, required: true },
  },
  { timestamps: true }
);

GalleryImageSchema.index({ album: 1, year: -1 });

const GalleryImage: Model<IGalleryImage> =
  (models.GalleryImage as Model<IGalleryImage>) ||
  model<IGalleryImage>("GalleryImage", GalleryImageSchema);

export default GalleryImage;
