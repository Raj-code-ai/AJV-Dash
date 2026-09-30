"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiAward,
  FiFileText,
  FiHome,
  FiImage,
  FiLogOut,
  FiSettings,
  FiUsers,
  FiActivity,
  FiUserCheck,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/fetchers";
import type { AuthUser } from "@/types";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/layout/ThemeToggle";

const baseLinks = [
  { href: "/admin", label: "Dashboard", Icon: FiHome },
  { href: "/admin/faculty", label: "Faculty", Icon: FiUsers },
  { href: "/admin/achievements", label: "Achievements", Icon: FiAward },
  { href: "/admin/gallery", label: "Gallery", Icon: FiImage },
  { href: "/admin/notices", label: "Notices", Icon: FiFileText },
];

const superLinks = [
  { href: "/admin/settings", label: "Settings", Icon: FiSettings },
  { href: "/admin/users", label: "Users", Icon: FiUserCheck },
  { href: "/admin/logs", label: "Activity Logs", Icon: FiActivity },
];

export default function AdminSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isSuper = user.role === "super_admin";
  const links = isSuper ? [...baseLinks, ...superLinks] : baseLinks;

  async function logout() {
    await apiPost("/api/auth/logout");
    toast.success("Logged out");
    router.push("/admin/login");
    router.refresh();
  }

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
          Admin Panel
        </p>
        <p className="mt-1 truncate font-display text-lg font-semibold text-white">
          {user.name}
        </p>
        <p className="truncate text-xs text-slate-300">
          {user.role === "super_admin" ? "Super Admin" : "Admin"}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ href, label, Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-academic-teal text-academic-navy"
                  : "text-slate-200 hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 px-3 py-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-300">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          className="block rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
        >
          View public site
        </Link>
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/20 text-white hover:bg-white/10"
          onClick={logout}
        >
          <FiLogOut /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 bg-academic-navy lg:block">
        {Nav}
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-academic-ink/90 lg:hidden">
        <p className="font-semibold text-academic-navy dark:text-white">
          Admin
        </p>
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 bg-academic-navy shadow-soft">
            {Nav}
          </aside>
        </div>
      )}
    </>
  );
}
