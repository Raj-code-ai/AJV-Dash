"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import type { GalleryAlbum } from "@/types";
import Select from "@/components/ui/Select";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function GalleryBrowser({
  albums,
  years,
  initialYear,
}: {
  albums: GalleryAlbum[];
  years: number[];
  initialYear: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-8 max-w-xs">
        <Select
          label="Filter by year"
          value={initialYear}
          onChange={(e) => {
            const value = e.target.value;
            router.push(value ? `${pathname}?year=${value}` : pathname);
          }}
          placeholder="All years"
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
        />
      </div>

      {albums.length === 0 ? (
        <EmptyState title="No albums yet" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link key={album._id} href={`/gallery/${album._id}`}>
              <Card className="overflow-hidden !p-0 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
                  {album.coverImageUrl ? (
                    <Image
                      src={album.coverImageUrl}
                      alt={album.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No cover
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <CardTitle className="text-lg">{album.title}</CardTitle>
                  <p className="mt-1 text-xs font-semibold text-academic-teal">
                    {album.year}
                  </p>
                  {album.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {album.description}
                    </CardDescription>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
