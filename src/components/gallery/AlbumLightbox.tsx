"use client";

import { useState } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryImage } from "@/types";

export default function AlbumLightbox({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const current = index !== null ? images[index] : null;

  function prev() {
    if (index === null) return;
    setIndex((index - 1 + images.length) % images.length);
  }

  function next() {
    if (index === null) return;
    setIndex((index + 1) % images.length);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img._id}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-soft dark:bg-slate-800"
          >
            <Image
              src={img.imageUrl}
              alt={img.title || "Gallery image"}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 33vw"
            />
            {img.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 text-left text-sm text-white">
                {img.title}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-academic-navy/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 rounded-xl bg-white/10 p-2 text-white"
              onClick={() => setIndex(null)}
            >
              <FiX className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Previous"
              className="absolute left-3 rounded-xl bg-white/10 p-2 text-white sm:left-6"
              onClick={prev}
            >
              <FiChevronLeft className="h-6 w-6" />
            </button>
            <div className="relative h-[70vh] w-full max-w-5xl">
              <Image
                src={current.imageUrl}
                alt={current.title || "Gallery image"}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <button
              type="button"
              aria-label="Next"
              className="absolute right-3 rounded-xl bg-white/10 p-2 text-white sm:right-6"
              onClick={next}
            >
              <FiChevronRight className="h-6 w-6" />
            </button>
            {current.title && (
              <p className="absolute bottom-6 text-center text-sm text-white">
                {current.title}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
