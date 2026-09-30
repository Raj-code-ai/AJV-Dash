"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { uploadImage } from "@/lib/fetchers";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  hint?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = "department-cms",
  hint,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file?: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be 8MB or smaller");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadImage(file, folder);
      if (res.success && res.data?.url) {
        onChange(res.data.url);
        toast.success("Image uploaded");
      } else {
        toast.error(res.error || "Upload failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const isLocal = value.startsWith("/");

  return (
    <div className="space-y-3">
      <Input
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... or upload below"
        hint={
          hint ||
          "Upload an image (saved locally or to Cloudinary) or paste a URL"
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <span className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-300 px-3 text-sm font-semibold text-academic-ink hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800">
            {uploading ? "Uploading..." : "Upload image"}
          </span>
        </label>
        {value && (
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <Image
              src={value}
              alt="Preview"
              fill
              unoptimized={isLocal}
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
