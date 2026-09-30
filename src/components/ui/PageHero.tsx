"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
  compact?: boolean;
}

export default function PageHero({
  title,
  subtitle,
  imageUrl,
  className,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-hero-gradient text-white",
        compact ? "py-14 sm:py-16" : "py-16 sm:py-20",
        className
      )}
    >
      {imageUrl && (
        <div className="absolute inset-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-academic-navy/90 via-academic-navy/75 to-academic-teal/40" />
        </div>
      )}
      <div className="container-page relative">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-100/90 sm:text-lg">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
