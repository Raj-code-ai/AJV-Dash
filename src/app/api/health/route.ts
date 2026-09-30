import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const hasMongoUri = Boolean(process.env.MONGODB_URI?.trim());
  const uriLooksLocal =
    process.env.MONGODB_URI?.includes("127.0.0.1") ||
    process.env.MONGODB_URI?.includes("localhost") ||
    false;

  const payload: Record<string, unknown> = {
    ok: false,
    vercel: Boolean(process.env.VERCEL),
    hasMongoUri,
    uriLooksLocal,
    nodeEnv: process.env.NODE_ENV || null,
  };

  if (!hasMongoUri) {
    payload.error =
      "MONGODB_URI is missing in Vercel Environment Variables (Production).";
    return NextResponse.json(payload, { status: 500 });
  }

  if (uriLooksLocal) {
    payload.error =
      "MONGODB_URI is set to localhost. Replace it with your Atlas mongodb+srv URI.";
    return NextResponse.json(payload, { status: 500 });
  }

  try {
    await connectDB();
    payload.ok = true;
    payload.db = "connected";
    return NextResponse.json(payload);
  } catch (err) {
    payload.ok = false;
    payload.db = "disconnected";
    payload.error = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json(payload, { status: 500 });
  }
}
