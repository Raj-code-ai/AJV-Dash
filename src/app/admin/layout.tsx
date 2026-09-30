"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiGet } from "@/lib/fetchers";
import type { AuthUser } from "@/types";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!isLogin);

  useEffect(() => {
    if (isLogin) {
      setLoading(false);
      return;
    }

    let active = true;
    async function check() {
      setLoading(true);
      const res = await apiGet<AuthUser>("/api/auth/me");
      if (!active) return;
      if (!res.success || !res.data) {
        router.replace("/admin/login");
        return;
      }
      const u = res.data;
      setUser({
        ...u,
        id: u._id || u.id,
      });
      setLoading(false);
    }
    check();
    return () => {
      active = false;
    };
  }, [isLogin, pathname, router]);

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="page-shell min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex min-h-screen">
      <AdminSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="container-page flex-1 py-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
