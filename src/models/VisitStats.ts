import { Document, Model, Schema, models, model } from "mongoose";

export interface IVisitStats extends Document {
  key: string;
  totalVisits: number;
  uniqueVisitors: number;
  createdAt: Date;
  updatedAt: Date;
}

const VisitStatsSchema = new Schema<IVisitStats>(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    totalVisits: { type: Number, default: 0, min: 0 },
    uniqueVisitors: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const VisitStats: Model<IVisitStats> =
  (models.VisitStats as Model<IVisitStats>) ||
  model<IVisitStats>("VisitStats", VisitStatsSchema);

export default VisitStats;
