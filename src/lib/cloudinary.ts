import ImageKit from "imagekit";
import { randomUUID } from "crypto";

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  storage: "imagekit";
}

const PLACEHOLDER_VALUES = new Set([
  "",
  "your_public_key",
  "your_private_key",
  "your_url_endpoint",
]);

function getImageKitEndpoint(): string {
  const endpoint =
    process.env.IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/vvt2npcxp";
  return endpoint.replace(/\/$/, "");
}

export function isImageKitConfigured(): boolean {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const endpoint = getImageKitEndpoint();
  return (
    !PLACEHOLDER_VALUES.has(publicKey) &&
    !PLACEHOLDER_VALUES.has(privateKey) &&
    Boolean(endpoint) &&
    !PLACEHOLDER_VALUES.has(endpoint)
  );
}

function getImageKit() {
  if (!isImageKitConfigured()) {
    throw new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env.local"
    );
  }

  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: getImageKitEndpoint(),
  });
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

function toBuffer(input: Buffer | string): Buffer {
  if (Buffer.isBuffer(input)) return input;
  if (input.startsWith("data:")) {
    const base64 = input.split(",")[1] || "";
    return Buffer.from(base64, "base64");
  }
  return Buffer.from(input, "base64");
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
  const { folder = "department-cms", mimeType = "image/jpeg" } = options;
  const buffer = toBuffer(input);

  if (!buffer.length) {
    throw new Error("Empty image file");
  }
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error("Image too large. Maximum size is 8MB.");
  }

  const imagekit = getImageKit();
  const ext = extensionFromMime(mimeType);
  const fileName = `${randomUUID()}.${ext}`;
  const safeFolder = sanitizeFolder(folder);

  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder: `/${safeFolder}`,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    publicId: result.fileId,
    width: result.width,
    height: result.height,
    format: (result as { fileType?: string }).fileType || ext,
    storage: "imagekit",
  };
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!publicId) return false;

  try {
    const imagekit = getImageKit();
    await imagekit.deleteFile(publicId);
    return true;
  } catch (err) {
    console.error("ImageKit delete failed:", err);
    return false;
  }
}

/** @deprecated */
export function isCloudinaryConfigured(): boolean {
  return false;
}

export default { uploadImage, deleteImage, isImageKitConfigured };
