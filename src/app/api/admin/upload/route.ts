import { NextRequest } from "next/server";
import {
  success,
  error,
  requireRole,
  isErrorResponse,
  getClientIp,
} from "@/lib/api";
import { uploadImage } from "@/lib/cloudinary";
import { uploadBase64Schema, parseBody } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["admin", "super_admin"]);
    if (isErrorResponse(auth)) return auth;

    const contentType = request.headers.get("content-type") || "";

    let result;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") || formData.get("image");
      const folder = (formData.get("folder") as string) || "department-cms";

      if (!file || !(file instanceof File)) {
        return error("No file provided. Use field name 'file' or 'image'.", 400);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || "image/jpeg";

      result = await uploadImage(buffer, {
        folder,
        mimeType,
        quality: "auto:good",
      });
    } else {
      const body = await request.json();
      const parsed = parseBody(uploadBase64Schema, body);

      if (!parsed.success) {
        return error(parsed.error, 400, parsed.details);
      }

      result = await uploadImage(parsed.data.image, {
        folder: parsed.data.folder || "department-cms",
        mimeType: parsed.data.mimeType || "image/jpeg",
        quality: "auto:good",
      });
    }

    await logActivity({
      userId: auth.id,
      action: "upload",
      entity: "Media",
      details: `Uploaded image: ${result.publicId}`,
      ip: getClientIp(request),
    });

    return success({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      storage: result.storage,
    });
  } catch (err) {
    console.error("POST /api/admin/upload:", err);
    const message =
      err instanceof Error ? err.message : "Failed to upload image";
    return error(message, 500);
  }
}
