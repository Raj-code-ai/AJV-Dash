"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/fetchers";
import type { Faculty } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Card } from "@/components/ui/Card";

type FormState = {
  name: string;
  designation: string;
  qualification: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  photoUrl: string;
  researchInterests: string;
  bio: string;
  isFeatured: boolean;
  order: number;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  designation: "",
  qualification: "",
  email: "",
  phone: "",
  linkedinUrl: "",
  githubUrl: "",
  photoUrl: "",
  researchInterests: "",
  bio: "",
  isFeatured: false,
  order: 0,
  isActive: true,
};

export default function AdminFacultyPage() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    const res = await apiGet<Faculty[]>("/api/admin/faculty");
    if (res.success && res.data) setItems(res.data);
    else toast.error(res.error || "Failed to load faculty");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item: Faculty) {
    setEditing(item);
    setForm({
      name: item.name,
      designation: item.designation,
      qualification: item.qualification,
      email: item.email,
      phone: item.phone || "",
      linkedinUrl: item.linkedinUrl || "",
      githubUrl: item.githubUrl || "",
      photoUrl: item.photoUrl,
      researchInterests: item.researchInterests?.join(", ") || "",
      bio: item.bio,
      isFeatured: item.isFeatured,
      order: item.order,
      isActive: item.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      designation: form.designation,
      qualification: form.qualification,
      email: form.email,
      phone: form.phone,
      linkedinUrl: form.linkedinUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      photoUrl: form.photoUrl,
      researchInterests: form.researchInterests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      bio: form.bio,
      isFeatured: form.isFeatured,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };

    setSaving(true);
    const res = editing
      ? await apiPut(`/api/admin/faculty/${editing._id}`, payload)
      : await apiPost("/api/admin/faculty", payload);
    setSaving(false);

    if (res.success) {
      toast.success(editing ? "Faculty updated" : "Faculty created");
      setOpen(false);
      load();
    } else {
      toast.error(res.error || "Save failed");
    }
  }

  async function onDelete(item: Faculty) {
    if (!confirm(`Delete ${item.name}?`)) return;
    const res = await apiDelete(`/api/admin/faculty/${item._id}`);
    if (res.success) {
      toast.success("Deleted");
      load();
    } else toast.error(res.error || "Delete failed");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
            Faculty
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage faculty profiles shown on the public site.
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add Faculty
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No faculty yet"
          action={
            <Button onClick={openCreate}>
              <FiPlus /> Add Faculty
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Designation</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                        <Image
                          src={item.photoUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.designation}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.isFeatured && <Badge tone="info">Featured</Badge>}
                      <Badge tone={item.isActive ? "success" : "danger"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(item)}
                      >
                        <FiEdit2 />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(item)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Faculty" : "Add Faculty"}
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Designation"
              required
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
            />
            <Input
              label="Qualification"
              required
              value={form.qualification}
              onChange={(e) =>
                setForm({ ...form, qualification: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Order"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
            />
            <Input
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/username"
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm({ ...form, linkedinUrl: e.target.value })
              }
            />
            <Input
              label="GitHub URL"
              type="url"
              placeholder="https://github.com/username"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            />
          </div>
          <ImageUploadField
            label="Photo URL"
            value={form.photoUrl}
            onChange={(photoUrl) => setForm({ ...form, photoUrl })}
            folder="faculty"
          />
          <Input
            label="Research interests (comma-separated)"
            value={form.researchInterests}
            onChange={(e) =>
              setForm({ ...form, researchInterests: e.target.value })
            }
          />
          <Textarea
            label="Bio"
            required
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />
              Featured
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
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
