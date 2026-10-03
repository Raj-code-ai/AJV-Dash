"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiAward,
  FiFileText,
  FiImage,
  FiUsers,
  FiUserCheck,
  FiFolder,
  FiEye,
} from "react-icons/fi";
import { apiGet } from "@/lib/fetchers";
import type { AdminStats } from "@/types";
import { Card, CardTitle } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

const cards = [
  { key: "faculty" as const, label: "Faculty", Icon: FiUsers, href: "/admin/faculty" },
  {
    key: "achievements" as const,
    label: "Achievements",
    Icon: FiAward,
    href: "/admin/achievements",
  },
  {
    key: "albums" as const,
    label: "Gallery Albums",
    Icon: FiFolder,
    href: "/admin/gallery",
  },
  {
    key: "galleryImages" as const,
    label: "Gallery Images",
    Icon: FiImage,
    href: "/admin/gallery",
  },
  {
    key: "notices" as const,
    label: "Notices",
    Icon: FiFileText,
    href: "/admin/notices",
  },
  {
    key: "activeNotices" as const,
    label: "Active Notices",
    Icon: FiFileText,
    href: "/admin/notices",
  },
  {
    key: "admins" as const,
    label: "Admin Users",
    Icon: FiUserCheck,
    href: "/admin/users",
  },
  {
    key: "totalVisits" as const,
    label: "Total Visits",
    Icon: FiEye,
    href: "/",
  },
  {
    key: "uniqueVisitors" as const,
    label: "Unique Visitors",
    Icon: FiUsers,
    href: "/",
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await apiGet<AdminStats>("/api/admin/stats");
      if (res.success && res.data) setStats(res.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Overview of department CMS content.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ key, label, Icon, href }) => (
            <Link key={key} href={href}>
              <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-academic-navy/5 text-academic-teal dark:bg-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-academic-navy dark:text-white">
                      {stats?.[key] ?? 0}
                    </p>
                    <CardTitle className="!text-sm !font-medium text-slate-500">
                      {label}
                    </CardTitle>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
