import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiImage,
  FiMail,
} from "react-icons/fi";
import { formatDate } from "@/lib/fetchers";
import {
  getAchievements,
  getFaculty,
  getNotices,
  getSettings,
} from "@/lib/data";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import HomeHero from "@/components/home/HomeHero";

export const dynamic = "force-dynamic";

async function loadHomeData() {
  const [settings, notices, achievements, faculty] = await Promise.all([
    getSettings(),
    getNotices(),
    getAchievements(),
    getFaculty({ featured: true }),
  ]);

  return {
    settings,
    notices: notices.slice(0, 5),
    achievements: achievements.slice(0, 3),
    faculty: faculty.slice(0, 4),
  };
}

const statIcons = [
  { key: "students" as const, label: "Students", Icon: FiUsers },
  { key: "faculty" as const, label: "Faculty", Icon: FiBookOpen },
  { key: "achievements" as const, label: "Achievements", Icon: FiAward },
  { key: "placements" as const, label: "Placement %", Icon: FiBriefcase },
];

const quickLinks = [
  { href: "/notices", label: "Notices", Icon: FiFileText },
  { href: "/faculty", label: "Faculty", Icon: FiUsers },
  { href: "/gallery", label: "Gallery", Icon: FiImage },
  { href: "/resources", label: "Resources", Icon: FiBookOpen },
  { href: "/achievements", label: "Achievements", Icon: FiAward },
  { href: "/contact", label: "Contact", Icon: FiMail },
];

export default async function HomePage() {
  const { settings, notices, achievements, faculty } = await loadHomeData();

  return (
    <div>
      <HomeHero settings={settings} />

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHeading
              eyebrow="About the department"
              title={settings?.departmentName || "Our Department"}
              description={settings?.departmentDescription}
            />
            {settings?.welcomeMessage && (
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {settings.welcomeMessage}
              </p>
            )}
          </div>

          <Card className="h-fit">
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                {settings?.hodPhotoUrl ? (
                  <Image
                    src={settings.hodPhotoUrl}
                    alt={settings.hodName || "HOD"}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    Photo
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-academic-teal">
                  Message from HOD
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-academic-navy dark:text-white">
                  {settings?.hodName || "Head of Department"}
                </h3>
                <p className="text-sm text-slate-500">
                  {settings?.hodDesignation || "Head of Department"}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {settings?.hodMessage ||
                "A welcome message from the Head of Department will appear here."}
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-white/50 py-12 dark:bg-white/5">
        <div className="container-page grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statIcons.map(({ key, label, Icon }) => (
            <Card key={key} className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-academic-navy/5 text-academic-teal dark:bg-white/10">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-academic-navy dark:text-white">
                  {settings?.stats?.[key] ?? 0}
                  {key === "placements" ? "%" : "+"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {label}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionHeading
            className="mb-0"
            eyebrow="Updates"
            title="Latest Notices"
          />
          <Link
            href="/notices"
            className="inline-flex items-center gap-1 text-sm font-semibold text-academic-teal"
          >
            View all <FiArrowRight />
          </Link>
        </div>
        {notices.length === 0 ? (
          <EmptyState title="No notices yet" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notices.map((notice) => (
              <Card key={notice._id}>
                <div className="mb-3 flex items-center gap-2">
                  {notice.isImportant && <Badge tone="danger">Important</Badge>}
                  <span className="text-xs text-slate-500">
                    {formatDate(notice.publishedAt)}
                  </span>
                </div>
                <CardTitle className="text-lg">{notice.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-3">
                  {notice.content}
                </CardDescription>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white/50 py-14 dark:bg-white/5">
        <div className="container-page">
          <div className="mb-6 flex items-end justify-between gap-4">
            <SectionHeading
              className="mb-0"
              eyebrow="Highlights"
              title="Recent Achievements"
            />
            <Link
              href="/achievements"
              className="inline-flex items-center gap-1 text-sm font-semibold text-academic-teal"
            >
              View all <FiArrowRight />
            </Link>
          </div>
          {achievements.length === 0 ? (
            <EmptyState title="No achievements yet" />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {achievements.map((item) => (
                <Card key={item._id} className="overflow-hidden !p-0">
                  {item.imageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <Badge tone="info" className="mb-2 capitalize">
                      {item.category}
                    </Badge>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
                      {item.description}
                    </CardDescription>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <SectionHeading
            className="mb-0"
            eyebrow="People"
            title="Featured Faculty"
          />
          <Link
            href="/faculty"
            className="inline-flex items-center gap-1 text-sm font-semibold text-academic-teal"
          >
            View all <FiArrowRight />
          </Link>
        </div>
        {faculty.length === 0 ? (
          <EmptyState title="No faculty listed yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {faculty.map((member) => (
              <Link key={member._id} href={`/faculty/${member._id}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <CardTitle className="text-center text-lg">
                    {member.name}
                  </CardTitle>
                  <p className="mt-1 text-center text-sm text-academic-teal">
                    {member.designation}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pb-16">
        <SectionHeading
          eyebrow="Explore"
          title="Quick Links"
          description="Jump to the most-used sections of the department site."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ href, label, Icon }) => (
            <Link key={href} href={href}>
              <Card className="flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-academic-navy text-white dark:bg-academic-teal dark:text-academic-navy">
                  <Icon />
                </div>
                <span className="font-semibold text-academic-navy dark:text-white">
                  {label}
                </span>
                <FiArrowRight className="ml-auto text-slate-400" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
