import Link from "next/link";
import { FiExternalLink, FiBookOpen, FiFileText } from "react-icons/fi";
import { getSettings } from "@/lib/data";
import PageHero from "@/components/ui/PageHero";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resources" };

export default async function ResourcesPage() {
  const settings = await getSettings();

  const portals = [
    {
      title: "Notes Portal",
      description:
        "Access lecture notes and study materials maintained in the external notes portal.",
      url: settings?.notesPortalUrl,
      Icon: FiBookOpen,
    },
    {
      title: "Question Paper Repository",
      description:
        "Browse previous-year question papers via the external repository link.",
      url: settings?.questionPaperPortalUrl,
      Icon: FiFileText,
    },
  ].filter((p) => p.url);

  return (
    <div>
      <PageHero
        title="Resources"
        subtitle="External academic portals for notes and question papers. No files are stored on this site."
        imageUrl={settings?.heroImageUrl}
        compact
      />

      <div className="container-page py-12">
        {portals.length === 0 ? (
          <EmptyState
            title="Resource links not configured"
            description="The Super Admin can set Notes Portal and Question Paper Repository URLs in Site Settings."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {portals.map(({ title, description, url, Icon }) => (
              <a
                key={title}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-academic-navy text-white dark:bg-academic-teal dark:text-academic-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {title} <FiExternalLink className="h-4 w-4 text-academic-teal" />
                  </CardTitle>
                  <CardDescription className="mt-2">{description}</CardDescription>
                  <p className="mt-4 truncate text-xs text-slate-500">{url}</p>
                </Card>
              </a>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          Looking for department updates?{" "}
          <Link href="/notices" className="font-semibold text-academic-teal">
            View notices
          </Link>
        </p>
      </div>
    </div>
  );
}
