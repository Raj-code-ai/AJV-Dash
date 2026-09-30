import { FiDownload } from "react-icons/fi";
import { formatDate } from "@/lib/fetchers";
import { getNotices, getSettings } from "@/lib/data";
import type { Notice } from "@/types";
import PageHero from "@/components/ui/PageHero";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notices" };

export default async function NoticesPage() {
  const [settings, notices] = await Promise.all([getSettings(), getNotices()]);

  const important = notices.filter((n) => n.isImportant);
  const latest = notices.filter((n) => !n.isImportant);

  return (
    <div>
      <PageHero
        title="Notices"
        subtitle={`Official announcements from ${
          settings?.departmentName || "the department"
        }.`}
        imageUrl={settings?.heroImageUrl}
        compact
      />

      <div className="container-page space-y-12 py-12">
        <section>
          <h2 className="mb-5 font-display text-2xl font-semibold text-academic-navy dark:text-white">
            Important Notices
          </h2>
          {important.length === 0 ? (
            <EmptyState title="No important notices" />
          ) : (
            <div className="grid gap-4">
              {important.map((notice) => (
                <NoticeCard key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-5 font-display text-2xl font-semibold text-academic-navy dark:text-white">
            Latest Notices
          </h2>
          {latest.length === 0 ? (
            <EmptyState title="No notices yet" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {latest.map((notice) => (
                <NoticeCard key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {notice.isImportant && <Badge tone="danger">Important</Badge>}
        <span className="text-xs text-slate-500">
          Published {formatDate(notice.publishedAt)}
        </span>
        {notice.expiresAt && (
          <span className="text-xs text-slate-500">
            · Expires {formatDate(notice.expiresAt)}
          </span>
        )}
      </div>
      <CardTitle className="text-lg">{notice.title}</CardTitle>
      <CardDescription className="mt-2 whitespace-pre-wrap">
        {notice.content}
      </CardDescription>
      {notice.pdfUrl && (
        <a
          href={notice.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-academic-teal"
        >
          <FiDownload /> Download PDF
        </a>
      )}
    </Card>
  );
}
