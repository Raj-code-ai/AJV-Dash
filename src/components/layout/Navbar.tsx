"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX, FiLock, FiGrid } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/ui/Skeleton";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/faculty", label: "Faculty" },
  { href: "/achievements", label: "Achievements" },
  { href: "/gallery", label: "Gallery" },
  { href: "/notices", label: "Notices" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

function LogoBox({
  src,
  alt,
}: {
  src?: string;
  alt: string;
}) {
  if (src) {
    return (
      <div className="relative h-[60px] w-[60px] overflow-hidden rounded-xl bg-white/70 shadow-soft dark:bg-white/10">
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={src.startsWith("/")}
          className="object-contain p-1"
          sizes="60px"
        />
      </div>
    );
  }
  return (
    <div
      className="flex h-[60px] w-[60px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/50 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-600 dark:bg-white/5"
      aria-hidden
    >
      Logo
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { settings, loading } = useSettings();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const portalHref = "/admin";
  const portalLabel = "Dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-academic-ink/80">
      <div className="container-page">
        <div className="flex h-[76px] items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {loading ? (
              <>
                <Skeleton className="h-[60px] w-[60px]" />
                <Skeleton className="h-[60px] w-[60px]" />
              </>
            ) : (
              <>
                <LogoBox
                  src={settings?.universityLogoUrl}
                  alt={settings?.universityName || "University logo"}
                />
                <LogoBox
                  src={settings?.departmentLogoUrl}
                  alt={settings?.departmentName || "Department logo"}
                />
              </>
            )}
            <div className="min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-52" />
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-academic-navy dark:text-white">
                    {settings?.universityName || "University"}
                  </p>
                  <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                    {settings?.departmentName || "Department"}
                  </p>
                </>
              )}
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "link-nav rounded-lg px-2.5 py-2",
                    active && "text-academic-teal dark:text-teal-300"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href={portalHref}
                className="hidden items-center gap-1.5 rounded-xl bg-academic-teal px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 sm:inline-flex"
                title={user?.name ? `Signed in as ${user.name}` : "Admin dashboard"}
              >
                <FiGrid className="h-4 w-4" />
                {portalLabel}
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-academic-navy transition hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 sm:inline-flex"
              >
                <FiLock className="h-4 w-4" />
                Login
              </Link>
            )}
            <button
              type="button"
              className="inline-flex rounded-xl p-2 text-academic-navy hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 xl:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200/70 bg-white/95 dark:border-slate-700 dark:bg-academic-ink/95 xl:hidden"
          >
            <nav className="container-page flex flex-col gap-1 py-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-academic-ink hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link
                  href={portalHref}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-academic-teal"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/admin/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-academic-teal"
                >
                  Login
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
