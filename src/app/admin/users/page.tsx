"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiSlash, FiTrash2 } from "react-icons/fi";
import { apiDelete, apiGet, apiPost, apiPut, formatDate } from "@/lib/fetchers";
import type { AdminUser } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  async function load() {
    setLoading(true);
    const res = await apiGet<AdminUser[]>("/api/admin/users");
    if (res.success && res.data) setUsers(res.data);
    else toast.error(res.error || "Failed to load users");
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await apiPost("/api/admin/users", {
      name: form.name,
      email: form.email,
      password: form.password,
      role: "admin",
    });
    setSaving(false);
    if (res.success) {
      toast.success("Admin created");
      setOpen(false);
      setForm({ name: "", email: "", password: "", role: "admin" });
      load();
    } else toast.error(res.error || "Create failed");
  }

  async function toggleActive(user: AdminUser) {
    const res = await apiPut(`/api/admin/users/${user._id}`, {
      isActive: !user.isActive,
    });
    if (res.success) {
      toast.success(user.isActive ? "User disabled" : "User enabled");
      load();
    } else toast.error(res.error || "Update failed");
  }

  async function disableUser(user: AdminUser) {
    if (!confirm(`Disable ${user.email}?`)) return;
    const res = await apiDelete(`/api/admin/users/${user._id}`);
    if (res.success) {
      toast.success("User disabled");
      load();
    } else toast.error(res.error || "Failed");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
            Users
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Create and manage department admins. Super Admin only.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <FiPlus /> Create Admin
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        user.role === "super_admin" ? "warning" : "info"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(user)}
                        title={user.isActive ? "Disable" : "Enable"}
                      >
                        <FiSlash />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => disableUser(user)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Create Admin">
        <form onSubmit={onCreate} className="space-y-4">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Select
            label="Role"
            value="admin"
            disabled
            options={[{ value: "admin", label: "Admin" }]}
          />
          <p className="text-xs text-slate-500">
            Only role=admin can be created here.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
