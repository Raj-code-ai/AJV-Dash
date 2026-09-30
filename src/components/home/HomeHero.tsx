"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { SiteSettings } from "@/types";
import Button from "@/components/ui/Button";

export default function HomeHero({
  settings,
}: {
  settings?: SiteSettings | null;
}) {
  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-hero-gradient text-white">
      {settings?.heroImageUrl && (
        <div className="absolute inset-0">
          <Image
            src={settings.heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-academic-navy/90 via-academic-navy/70 to-academic-teal/45" />
        </div>
      )}

      <div className="container-page relative flex min-h-[72vh] flex-col justify-center py-20">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200"
        >
          {settings?.universityName || "University"}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          {settings?.heroTitle ||
            settings?.departmentName ||
            "Department Management System"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/90 sm:text-lg"
        >
          {settings?.heroSubtitle ||
            settings?.welcomeMessage ||
            "Explore faculty, notices, achievements, and academic resources."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link href="/about">
            <Button variant="secondary" size="lg">
              About the Department
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Contact Us
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
