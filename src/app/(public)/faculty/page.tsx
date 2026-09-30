import { getFaculty, getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import FacultyDirectory from "@/components/faculty/FacultyDirectory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Faculty" };

export default async function FacultyPage() {
  const [settings, faculty] = await Promise.all([
    getSettings(),
    getFaculty(),
  ]);

  return (
    <div>
      <PageHero
        title="Faculty"
        subtitle={`Meet the academic team of ${
          settings?.departmentName || "the department"
        }.`}
        imageUrl={settings?.heroImageUrl}
        compact
      />
      <div className="container-page py-12">
        <FacultyDirectory faculty={faculty} />
      </div>
    </div>
  );
}
