import { NextRequest, NextResponse } from "next/server";
import { success, error } from "@/lib/api";
import { getVisitCounts, recordVisit } from "@/lib/visits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SESSION_COOKIE = "dept_visit_session";
const UNIQUE_COOKIE = "dept_visit_uid";

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export async function GET() {
  try {
    const counts = await getVisitCounts();
    return success(counts);
  } catch (err) {
    console.error("GET /api/visits:", err);
    return error("Failed to load visit counts", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
    const hasUnique = Boolean(request.cookies.get(UNIQUE_COOKIE)?.value);

    const counts = await recordVisit({
      countSession: !hasSession,
      countUnique: !hasUnique,
    });

    const response = NextResponse.json({
      success: true,
      data: counts,
    });

    if (!hasSession) {
      response.cookies.set(SESSION_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: cookieSecure(),
        path: "/",
        // Session cookie — cleared when browser closes
      });
    }

    if (!hasUnique) {
      response.cookies.set(UNIQUE_COOKIE, crypto.randomUUID(), {
        httpOnly: true,
        sameSite: "lax",
        secure: cookieSecure(),
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (err) {
    console.error("POST /api/visits:", err);
    return error("Failed to record visit", 500);
  }
}
