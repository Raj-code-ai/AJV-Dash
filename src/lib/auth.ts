import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { UserRole } from "@/models/User";

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me_please_32chars_min";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function extractToken(request?: NextRequest): string | null {
  if (request) {
    const cookieToken = request.cookies.get("token")?.value;
    if (cookieToken) return cookieToken;

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice(7);
    }
    return null;
  }

  try {
    const cookieStore = cookies();
    return cookieStore.get("token")?.value || null;
  } catch {
    return null;
  }
}

export async function getAuthUser(
  request?: NextRequest
): Promise<AuthUser | null> {
  const token = extractToken(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
}

export const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  // Don't require HTTPS on localhost (npm start sets NODE_ENV=production)
  secure:
    process.env.NODE_ENV === "production" &&
    (process.env.NEXT_PUBLIC_APP_URL || "").startsWith("https"),
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
