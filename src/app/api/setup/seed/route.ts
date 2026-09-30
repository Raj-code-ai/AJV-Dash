import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error } from "@/lib/api";
import User from "@/models/User";
import SiteSettings from "@/models/SiteSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * One-time / emergency production seed.
 * POST /api/setup/seed
 * Header: x-setup-secret: <SETUP_SECRET from env>
 */
export async function POST(request: NextRequest) {
  try {
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
      return error("SETUP_SECRET is not configured on the server", 503);
    }

    const provided =
      request.headers.get("x-setup-secret") ||
      request.nextUrl.searchParams.get("secret") ||
      "";

    if (provided !== setupSecret) {
      return error("Unauthorized", 401);
    }

    await connectDB();

    const SUPER_EMAIL =
      process.env.SEED_SUPER_ADMIN_EMAIL || "superadmin@university.edu";
    const SUPER_PASS =
      process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin@123";
    const ADMIN_EMAIL =
      process.env.SEED_ADMIN_EMAIL || "admin@university.edu";
    const ADMIN_PASS = process.env.SEED_ADMIN_PASSWORD || "Admin@123";

    await SiteSettings.findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          universityName: "State University of Technology",
          departmentName: "Department of Computer Science & Engineering",
          departmentDescription:
            "Department website managed from the admin dashboard.",
          welcomeMessage: "Welcome to the department.",
          heroTitle: "Shape the Future of Computing",
          heroSubtitle: "Excellence in education, research, and innovation.",
          stats: {
            students: 1200,
            faculty: 45,
            achievements: 180,
            placements: 95,
          },
        },
      },
      { upsert: true, new: true }
    );

    let superAdmin = await User.findOne({
      email: SUPER_EMAIL.toLowerCase(),
    });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: "Super Admin",
        email: SUPER_EMAIL,
        password: SUPER_PASS,
        role: "super_admin",
        isActive: true,
      });
    } else {
      superAdmin.password = SUPER_PASS;
      superAdmin.isActive = true;
      superAdmin.role = "super_admin";
      await superAdmin.save();
    }

    let admin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (!admin) {
      admin = await User.create({
        name: "Department Admin",
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
        role: "admin",
        isActive: true,
      });
    } else {
      admin.password = ADMIN_PASS;
      admin.isActive = true;
      admin.role = "admin";
      await admin.save();
    }

    return success({
      message: "Production seed completed",
      logins: {
        superAdmin: { email: SUPER_EMAIL, password: SUPER_PASS },
        admin: { email: ADMIN_EMAIL, password: ADMIN_PASS },
      },
    });
  } catch (err) {
    console.error("POST /api/setup/seed:", err);
    const message = err instanceof Error ? err.message : "Seed failed";
    return error(message, 500);
  }
}
