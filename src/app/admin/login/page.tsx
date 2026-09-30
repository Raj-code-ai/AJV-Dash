"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/fetchers";
import type { AuthUser } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    setLoading(true);
    const res = await apiPost<AuthUser>("/api/auth/login", { email, password });
    setLoading(false);

    if (res.success) {
      toast.success(`Welcome, ${res.data?.name || "Admin"}`);
      const from = searchParams.get("from") || "/admin";
      router.push(from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } else {
      toast.error(res.error || "Login failed");
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardTitle>Admin Login</CardTitle>
        <CardDescription className="mt-2">
          Sign in to manage department content.
        </CardDescription>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            required
            autoComplete="email"
          />
          <Input
            name="password"
            type="password"
            label="Password"
            required
            minLength={6}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-academic-teal">
            ← Back to public site
          </Link>
        </p>
      </Card>
    </div>
  );
}
