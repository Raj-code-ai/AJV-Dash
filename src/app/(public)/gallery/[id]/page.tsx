import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { getAlbumById } from "@/lib/data";
import AlbumLightbox from "@/components/gallery/AlbumLightbox";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function GalleryAlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const album = await getAlbumById(params.id);
  if (!album) notFound();

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/gallery"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-academic-teal"
      >
        <FiArrowLeft /> Back to Gallery
      </Link>

      <div className="mb-8">
        <p className="text-sm font-semibold text-academic-teal">{album.year}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-academic-navy dark:text-white sm:text-4xl">
          {album.title}
        </h1>
        {album.description && (
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            {album.description}
          </p>
        )}
      </div>

      {album.images?.length ? (
        <AlbumLightbox images={album.images} />
      ) : (
        <EmptyState title="No images in this album" />
      )}
    </div>
  );
}
