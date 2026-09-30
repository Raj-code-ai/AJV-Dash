import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { success, error, getClientIp } from "@/lib/api";
import { contactSchema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = parseBody(contactSchema, body);

    if (!parsed.success) {
      return error(parsed.error, 400, parsed.details);
    }

    const { name, email, subject, message, phone } = parsed.data;
    const ip = getClientIp(request);

    // Log against first super_admin if available (system contact)
    const systemUser = await User.findOne({ role: "super_admin" }).select("_id");

    if (systemUser) {
      await logActivity({
        userId: systemUser._id,
        action: "contact_form",
        entity: "Contact",
        details: JSON.stringify({ name, email, subject, message, phone, ip }),
        ip,
      });
    }

    console.log("Contact form submission:", { name, email, subject, phone });

    return success(
      { message: "Thank you for contacting us. We will get back to you soon." },
      200
    );
  } catch (err) {
    console.error("POST /api/contact:", err);
    return error("Failed to submit contact form", 500);
  }
}
