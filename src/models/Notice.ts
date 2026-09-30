import { Document, Model, Schema, models, model } from "mongoose";

export interface INotice extends Document {
  title: string;
  content: string;
  isImportant: boolean;
  pdfUrl?: string;
  publishedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    isImportant: { type: Boolean, default: false },
    pdfUrl: { type: String },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoticeSchema.index({ publishedAt: -1, isActive: 1 });

const Notice: Model<INotice> =
  (models.Notice as Model<INotice>) ||
  model<INotice>("Notice", NoticeSchema);

export default Notice;
