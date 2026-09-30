"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { apiDelete, apiGet, apiPost, apiPut, formatDate } from "@/lib/fetchers";
import type { Notice } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

type FormState = {
  title: string;
  content: string;
  isImportant: boolean;
  pdfUrl: string;
  publishedAt: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  title: "",
  content: "",
  isImportant: false,
  pdfUrl: "",
  publishedAt: new Date().toISOString().slice(0, 16),
  expiresAt: "",
  isActive: true,
};

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminNoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    const res = await apiGet<Notice[]>("/api/admin/notices");
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

  function openEdit(item: Notice) {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      isImportant: item.isImportant,
      pdfUrl: item.pdfUrl || "",
      publishedAt: toLocalInput(item.publishedAt),
      expiresAt: toLocalInput(item.expiresAt),
      isActive: item.isActive,
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      isImportant: form.isImportant,
      pdfUrl: form.pdfUrl || undefined,
      publishedAt: form.publishedAt ? new Date(form.publishedAt) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
      isActive: form.isActive,
    };
    setSaving(true);
    const res = editing
      ? await apiPut(`/api/admin/notices/${editing._id}`, payload)
      : await apiPost("/api/admin/notices", payload);
    setSaving(false);
    if (res.success) {
      toast.success(editing ? "Updated" : "Created");
      setOpen(false);
      load();
    } else toast.error(res.error || "Save failed");
  }

  async function onDelete(item: Notice) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const res = await apiDelete(`/api/admin/notices/${item._id}`);
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
            Notices
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage announcements, PDFs, and expiry dates.
          </p>
        </div>
        <Button onClick={openCreate}>
          <FiPlus /> Add Notice
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
          title="No notices yet"
          action={
            <Button onClick={openCreate}>
              <FiPlus /> Add Notice
            </Button>
          }
        />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3 font-semibold">Published</th>
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
                    <div className="flex flex-wrap gap-1">
                      {item.isImportant && <Badge tone="danger">Important</Badge>}
                      <Badge tone={item.isActive ? "success" : "default"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatDate(item.publishedAt)}</td>
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
        title={editing ? "Edit Notice" : "Add Notice"}
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
            label="Content"
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <Input
            label="PDF URL"
            value={form.pdfUrl}
            onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Published at"
              type="datetime-local"
              value={form.publishedAt}
              onChange={(e) =>
                setForm({ ...form, publishedAt: e.target.value })
              }
            />
            <Input
              label="Expires at"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isImportant}
                onChange={(e) =>
                  setForm({ ...form, isImportant: e.target.checked })
                }
              />
              Important
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
