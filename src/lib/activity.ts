import { connectDB } from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import type { Types } from "mongoose";

export interface LogActivityInput {
  userId: string | Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    await connectDB();
    await ActivityLog.create({
      user: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      details: input.details,
      ip: input.ip,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
