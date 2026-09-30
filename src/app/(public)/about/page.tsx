import { getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "About" };

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHero
        title="About the Department"
        subtitle={
          settings
            ? `${settings.departmentName} at ${settings.universityName}`
            : "Learn about our history, vision, and mission."
        }
        imageUrl={settings?.heroImageUrl}
        compact
      />

      <div className="container-page space-y-12 py-14">
        <section>
          <SectionHeading eyebrow="Overview" title="Who We Are" />
          {settings?.departmentDescription || settings?.aboutHistory ? (
            <div className="prose-academic grid gap-6 lg:grid-cols-2">
              <Card>
                <CardTitle className="mb-3">Department Overview</CardTitle>
                <p>
                  {settings?.departmentDescription ||
                    "Department overview will appear here."}
                </p>
              </Card>
              <Card>
                <CardTitle className="mb-3">History</CardTitle>
                <p>
                  {settings?.aboutHistory ||
                    "Department history will appear here."}
                </p>
              </Card>
            </div>
          ) : (
            <EmptyState title="About content not configured yet" />
          )}
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle className="mb-3">Vision</CardTitle>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {settings?.vision || "Vision statement will appear here."}
            </p>
          </Card>
          <Card>
            <CardTitle className="mb-3">Mission</CardTitle>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {settings?.mission || "Mission statement will appear here."}
            </p>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Goals" title="Objectives" />
          {settings?.objectives?.length ? (
            <ol className="grid gap-3 md:grid-cols-2">
              {settings.objectives.map((obj, idx) => (
                <li key={idx}>
                  <Card className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-academic-navy text-sm font-semibold text-white dark:bg-academic-teal dark:text-academic-navy">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {obj}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState title="No objectives listed yet" />
          )}
        </section>
      </div>
    </div>
  );
}
