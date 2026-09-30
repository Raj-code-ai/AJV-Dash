import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  storage: "cloudinary" | "local";
}

const PLACEHOLDER_VALUES = new Set([
  "",
  "your_cloud_name",
  "your_api_key",
  "your_api_secret",
]);

export function isCloudinaryConfigured(): boolean {
  const name = process.env.CLOUDINARY_CLOUD_NAME || "";
  const key = process.env.CLOUDINARY_API_KEY || "";
  const secret = process.env.CLOUDINARY_API_SECRET || "";
  return (
    !PLACEHOLDER_VALUES.has(name) &&
    !PLACEHOLDER_VALUES.has(key) &&
    !PLACEHOLDER_VALUES.has(secret)
  );
}

function toDataUri(input: Buffer | string, mimeType = "image/jpeg"): string {
  if (typeof input === "string") {
    if (input.startsWith("data:")) return input;
    return `data:${mimeType};base64,${input}`;
  }
  return `data:${mimeType};base64,${input.toString("base64")}`;
}

function extensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
  };
  return map[mimeType] || "jpg";
}

function sanitizeFolder(folder: string): string {
  return (
    folder.replace(/[^a-zA-Z0-9/_-]/g, "").replace(/\.\./g, "") || "general"
  );
}

async function uploadLocally(
  input: Buffer | string,
  options: { folder?: string; mimeType?: string }
): Promise<UploadResult> {
  const folder = sanitizeFolder(options.folder || "department-cms");
  const mimeType = options.mimeType || "image/jpeg";

  let buffer: Buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (input.startsWith("data:")) {
    const base64 = input.split(",")[1] || "";
    buffer = Buffer.from(base64, "base64");
  } else {
    buffer = Buffer.from(input, "base64");
  }

  if (!buffer.length) {
    throw new Error("Empty image file");
  }

  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error("Image too large. Maximum size is 8MB.");
  }

  const ext = extensionFromMime(mimeType);
  const filename = `${randomUUID()}.${ext}`;
  const relativeDir = path.posix.join("uploads", folder);
  const absoluteDir = path.join(process.cwd(), "public", ...relativeDir.split("/"));
  await fs.mkdir(absoluteDir, { recursive: true });

  await fs.writeFile(path.join(absoluteDir, filename), buffer);

  return {
    url: `/${relativeDir}/${filename}`,
    publicId: `${folder}/${filename}`,
    format: ext,
    storage: "local",
  };
}

export async function uploadImage(
  input: Buffer | string,
  options: {
    folder?: string;
    publicId?: string;
    mimeType?: string;
    quality?: string | number;
  } = {}
): Promise<UploadResult> {
  const {
    folder = "department-cms",
    publicId,
    mimeType = "image/jpeg",
    quality = "auto:good",
  } = options;

  if (!isCloudinaryConfigured()) {
    return uploadLocally(input, { folder, mimeType });
  }

  const dataUri = toDataUri(input, mimeType);

  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id: publicId,
      resource_type: "image",
      quality,
      fetch_format: "auto",
      transformation: [{ quality }, { fetch_format: "auto" }],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      storage: "cloudinary",
    };
  } catch (err) {
    console.error(
      "Cloudinary upload failed, falling back to local storage:",
      err
    );
    return uploadLocally(input, { folder, mimeType });
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  try {
    const localPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      ...publicId.split("/")
    );
    await fs.unlink(localPath);
    return true;
  } catch {
    // not a local file (or already deleted)
  }

  if (!isCloudinaryConfigured()) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}

export default cloudinary;
