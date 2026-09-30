import { getAchievements, getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import AchievementsBrowser from "@/components/achievements/AchievementsBrowser";

export const dynamic = "force-dynamic";
export const metadata = { title: "Achievements" };

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: { year?: string; category?: string; q?: string };
}) {
  const [settings, all, filtered] = await Promise.all([
    getSettings(),
    getAchievements(),
    getAchievements({
      year: searchParams.year,
      category: searchParams.category,
      q: searchParams.q,
    }),
  ]);

  const years = Array.from(new Set(all.map((a) => a.year))).sort(
    (a, b) => b - a
  );

  return (
    <div>
      <PageHero
        title="Achievements"
        subtitle={`Milestones and recognition from ${
          settings?.departmentName || "the department"
        }.`}
        imageUrl={settings?.heroImageUrl}
        compact
      />
      <div className="container-page py-12">
        <AchievementsBrowser
          achievements={filtered}
          years={years}
          initialYear={searchParams.year || ""}
          initialCategory={searchParams.category || ""}
          initialQ={searchParams.q || ""}
        />
      </div>
    </div>
  );
}
