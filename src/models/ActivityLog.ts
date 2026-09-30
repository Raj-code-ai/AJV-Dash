import { Document, Model, Schema, Types, models, model } from "mongoose";

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    details: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ user: 1 });

const ActivityLog: Model<IActivityLog> =
  (models.ActivityLog as Model<IActivityLog>) ||
  model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
