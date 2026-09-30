import { getAlbums, getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import GalleryBrowser from "@/components/gallery/GalleryBrowser";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gallery" };

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const [settings, albums] = await Promise.all([getSettings(), getAlbums()]);

  const years = Array.from(new Set(albums.map((a) => a.year))).sort(
    (a, b) => b - a
  );
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const filtered =
    year && !Number.isNaN(year)
      ? albums.filter((a) => a.year === year)
      : albums;

  return (
    <div>
      <PageHero
        title="Gallery"
        subtitle="Campus moments, events, and department life."
        imageUrl={settings?.heroImageUrl}
        compact
      />
      <div className="container-page py-12">
        <GalleryBrowser
          albums={filtered}
          years={years}
          initialYear={searchParams.year || ""}
        />
      </div>
    </div>
  );
}
