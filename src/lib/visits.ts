import VisitStats from "@/models/VisitStats";
import { connectDB } from "@/lib/db";

export interface VisitCounts {
  totalVisits: number;
  uniqueVisitors: number;
}

async function getOrCreateDoc() {
  await connectDB();
  let doc = await VisitStats.findOne({ key: "global" });
  if (!doc) {
    doc = await VisitStats.create({
      key: "global",
      totalVisits: 0,
      uniqueVisitors: 0,
    });
  }
  return doc;
}

export async function getVisitCounts(): Promise<VisitCounts> {
  const doc = await getOrCreateDoc();
  return {
    totalVisits: doc.totalVisits || 0,
    uniqueVisitors: doc.uniqueVisitors || 0,
  };
}

export async function recordVisit(options: {
  countSession: boolean;
  countUnique: boolean;
}): Promise<VisitCounts> {
  await connectDB();

  const inc: Record<string, number> = {};
  if (options.countSession) inc.totalVisits = 1;
  if (options.countUnique) inc.uniqueVisitors = 1;

  if (Object.keys(inc).length === 0) {
    return getVisitCounts();
  }

  const doc = await VisitStats.findOneAndUpdate(
    { key: "global" },
    { $inc: inc, $setOnInsert: { key: "global" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    totalVisits: doc?.totalVisits || 0,
    uniqueVisitors: doc?.uniqueVisitors || 0,
  };
}
