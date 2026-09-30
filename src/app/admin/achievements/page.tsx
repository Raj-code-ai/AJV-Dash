"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiDelete, apiGet, apiPost, apiPut, formatDate } from "@/lib/fetchers";
import type { Achievement, AchievementCategory } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Card } from "@/components/ui/Card";

type FormState = {
  title: string;
  description: string;
  date: string;
  category: AchievementCategory;
  imageUrl: string;
  certificateUrl: string;
  year: number;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  category: "student",
  imageUrl: "",
  certificateUrl: "",
  year: new Date().getFullYear(),
};

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    const res = await apiGet<Achievement[]>("/api/admin/achievements");
    if (res.success && res.data) setItems(res.data);
    else toast.error(res.error || "Failed to load");
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

  function openEdit(item: Achievement) {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
      category: item.category,
      imageUrl: item.imageUrl || "",
      certificateUrl: item.certificateUrl || "",
      year: item.year,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      year: Number(form.year),
      imageUrl: form.imageUrl || undefined,
      certificateUrl: form.certificateUrl || undefined,
    };
    setSaving(true);
    const res = editing
      ? await apiPut(`/api/admin/achievements/${editing._id}`, payload)
      : await apiPost("/api/admin/achievements", payload);
    setSaving(false);
    if (res.success) {
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      load();
    } else toast.error(res.error || "Save failed");
  }

  async function onDelete(item: Achievement) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const res = await apiDelete(`/api/admin/achievements/${item._id}`);
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
            Achievements
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Publish student, faculty, and department achievements.
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add Achievement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No achievements yet"
          action={
            <Button onClick={openCreate}>
              <FiPlus /> Add Achievement
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3">
                    <Badge tone="info" className="capitalize">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(item.date)} · {item.year}
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
        title={editing ? "Edit Achievement" : "Add Achievement"}
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Year"
              type="number"
              required
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: Number(e.target.value) })
              }
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as AchievementCategory,
                })
              }
              options={[
                { value: "student", label: "Student" },
                { value: "faculty", label: "Faculty" },
                { value: "department", label: "Department" },
              ]}
            />
          </div>
          <ImageUploadField
            label="Image URL"
            value={form.imageUrl}
            onChange={(imageUrl) => setForm({ ...form, imageUrl })}
            folder="achievements"
          />
          <Input
            label="Certificate URL"
            value={form.certificateUrl}
            onChange={(e) =>
              setForm({ ...form, certificateUrl: e.target.value })
            }
          />
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
