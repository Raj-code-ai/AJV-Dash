"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  uploadImage,
} from "@/lib/fetchers";
import type { GalleryAlbum, GalleryImage } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Card, CardTitle } from "@/components/ui/Card";

type AlbumForm = {
  title: string;
  description: string;
  year: number;
  coverImageUrl: string;
};

const emptyAlbum: AlbumForm = {
  title: "",
  description: "",
  year: new Date().getFullYear(),
  coverImageUrl: "",
};

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GalleryAlbum | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumForm>(emptyAlbum);
  const [imageForm, setImageForm] = useState({
    album: "",
    title: "",
    imageUrl: "",
    year: new Date().getFullYear(),
  });
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const [albumsRes, imagesRes] = await Promise.all([
      apiGet<GalleryAlbum[]>("/api/admin/gallery/albums"),
      apiGet<GalleryImage[]>("/api/gallery/images"),
    ]);
    if (albumsRes.success && albumsRes.data) setAlbums(albumsRes.data);
    if (imagesRes.success && imagesRes.data) setImages(imagesRes.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreateAlbum() {
    setEditing(null);
    setAlbumForm(emptyAlbum);
    setAlbumOpen(true);
  }

  function openEditAlbum(album: GalleryAlbum) {
    setEditing(album);
    setAlbumForm({
      title: album.title,
      description: album.description || "",
      year: album.year,
      coverImageUrl: album.coverImageUrl || "",
    });
    setAlbumOpen(true);
  }

  async function saveAlbum(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: albumForm.title,
      description: albumForm.description,
      year: Number(albumForm.year),
      coverImageUrl: albumForm.coverImageUrl || undefined,
    };
    setSaving(true);
    const res = editing
      ? await apiPut(`/api/admin/gallery/albums/${editing._id}`, payload)
      : await apiPost("/api/admin/gallery/albums", payload);
    setSaving(false);
    if (res.success) {
      toast.success(editing ? "Album updated" : "Album created");
      setAlbumOpen(false);
      load();
    } else toast.error(res.error || "Save failed");
  }

  async function deleteAlbum(album: GalleryAlbum) {
    if (!confirm(`Delete album "${album.title}"?`)) return;
    const res = await apiDelete(`/api/admin/gallery/albums/${album._id}`);
    if (res.success) {
      toast.success("Album deleted");
      load();
    } else toast.error(res.error || "Delete failed");
  }

  async function saveImage(e: FormEvent) {
    e.preventDefault();
    if (!imageForm.album || !imageForm.imageUrl) {
      toast.error("Album and image URL are required");
      return;
    }
    setSaving(true);
    const res = await apiPost("/api/admin/gallery/images", {
      album: imageForm.album,
      title: imageForm.title,
      imageUrl: imageForm.imageUrl,
      year: Number(imageForm.year),
    });
    setSaving(false);
    if (res.success) {
      toast.success("Image added");
      setImageOpen(false);
      setImageForm({
        album: "",
        title: "",
        imageUrl: "",
        year: new Date().getFullYear(),
      });
      load();
    } else toast.error(res.error || "Save failed");
  }

  async function handleImageUpload(file?: File | null) {
    if (!file) return;
    setUploading(true);
    const res = await uploadImage(file, "gallery");
    setUploading(false);
    if (res.success && res.data?.url) {
      setImageForm((f) => ({ ...f, imageUrl: res.data!.url }));
      toast.success("Uploaded");
    } else toast.error(res.error || "Upload failed");
  }

  async function deleteImage(image: GalleryImage) {
    if (!confirm("Delete this image?")) return;
    const res = await apiDelete(`/api/admin/gallery/images/${image._id}`);
    if (res.success) {
      toast.success("Image deleted");
      load();
    } else toast.error(res.error || "Delete failed");
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
            Gallery
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage albums and upload images.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImageOpen(true)}>
            <FiUpload /> Add Image
          </Button>
          <Button onClick={openCreateAlbum}>
            <FiPlus /> Add Album
          </Button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-academic-navy dark:text-white">
          Albums
        </h2>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <EmptyState title="No albums yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Card key={album._id}>
                <div className="relative mb-3 h-36 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {album.coverImageUrl ? (
                    <Image
                      src={album.coverImageUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  ) : null}
                </div>
                <CardTitle className="text-lg">{album.title}</CardTitle>
                <p className="mt-1 text-xs text-academic-teal">{album.year}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditAlbum(album)}
                  >
                    <FiEdit2 />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteAlbum(album)}
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold text-academic-navy dark:text-white">
          Recent Images
        </h2>
        {images.length === 0 ? (
          <EmptyState title="No images yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {images.slice(0, 12).map((img) => (
              <Card key={img._id} className="!p-3">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={img.imageUrl}
                    alt={img.title || "Image"}
                    fill
                    className="object-cover"
                    sizes="25vw"
                  />
                </div>
                <p className="truncate text-sm font-medium">
                  {img.title || "Untitled"}
                </p>
                <Button
                  size="sm"
                  variant="danger"
                  className="mt-2 w-full"
                  onClick={() => deleteImage(img)}
                >
                  <FiTrash2 /> Delete
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={albumOpen}
        onClose={() => setAlbumOpen(false)}
        title={editing ? "Edit Album" : "Add Album"}
      >
        <form onSubmit={saveAlbum} className="space-y-4">
          <Input
            label="Title"
            required
            value={albumForm.title}
            onChange={(e) =>
              setAlbumForm({ ...albumForm, title: e.target.value })
            }
          />
          <Textarea
            label="Description"
            value={albumForm.description}
            onChange={(e) =>
              setAlbumForm({ ...albumForm, description: e.target.value })
            }
          />
          <Input
            label="Year"
            type="number"
            required
            value={albumForm.year}
            onChange={(e) =>
              setAlbumForm({ ...albumForm, year: Number(e.target.value) })
            }
          />
          <ImageUploadField
            label="Cover image URL"
            value={albumForm.coverImageUrl}
            onChange={(coverImageUrl) =>
              setAlbumForm({ ...albumForm, coverImageUrl })
            }
            folder="gallery"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAlbumOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title="Add Image"
      >
        <form onSubmit={saveImage} className="space-y-4">
          <Select
            label="Album"
            required
            value={imageForm.album}
            onChange={(e) =>
              setImageForm({ ...imageForm, album: e.target.value })
            }
            placeholder="Select album"
            options={albums.map((a) => ({ value: a._id, label: a.title }))}
          />
          <Input
            label="Title"
            value={imageForm.title}
            onChange={(e) =>
              setImageForm({ ...imageForm, title: e.target.value })
            }
          />
          <Input
            label="Year"
            type="number"
            required
            value={imageForm.year}
            onChange={(e) =>
              setImageForm({ ...imageForm, year: Number(e.target.value) })
            }
          />
          <ImageUploadField
            label="Image URL"
            value={imageForm.imageUrl}
            onChange={(imageUrl) => setImageForm({ ...imageForm, imageUrl })}
            folder="gallery"
          />
          <label className="inline-flex cursor-pointer text-sm font-semibold text-academic-teal">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
            />
            {uploading ? "Uploading..." : "Or pick a file to upload"}
          </label>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setImageOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
