import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiMail, FiPhone } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { getFacultyById } from "@/lib/data";
import { Card, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function FacultyProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const member = await getFacultyById(params.id);
  if (!member) notFound();

  return (
    <div className="container-page py-10 sm:py-14">
      <Link
        href="/faculty"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-academic-teal"
      >
        <FiArrowLeft /> Back to Faculty
      </Link>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit text-center">
          <div className="relative mx-auto mb-4 h-56 w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Image
              src={member.photoUrl}
              alt={member.name}
              fill
              unoptimized={member.photoUrl.startsWith("/")}
              className="object-cover"
              sizes="280px"
              priority
            />
          </div>
          <CardTitle>{member.name}</CardTitle>
          <p className="mt-1 text-sm font-medium text-academic-teal">
            {member.designation}
          </p>
          <p className="mt-2 text-sm text-slate-500">{member.qualification}</p>
          <div className="mt-4 space-y-2 text-left text-sm">
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-slate-600 hover:text-academic-teal dark:text-slate-300"
            >
              <FiMail /> {member.email}
            </a>
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-2 text-slate-600 hover:text-academic-teal dark:text-slate-300"
              >
                <FiPhone /> {member.phone}
              </a>
            )}
          </div>
          {(member.linkedinUrl || member.githubUrl) && (
            <div className="mt-5 flex items-center justify-center gap-3">
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-[#0A66C2] transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-white/10"
                  aria-label={`${member.name} on LinkedIn`}
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
              )}
              {member.githubUrl && (
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-white/10"
                  aria-label={`${member.name} on GitHub`}
                >
                  <FaGithub className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-3">Biography</CardTitle>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300">
              {member.bio}
            </p>
          </Card>
          <Card>
            <CardTitle className="mb-3">Research Interests</CardTitle>
            {member.researchInterests?.length ? (
              <div className="flex flex-wrap gap-2">
                {member.researchInterests.map((interest) => (
                  <Badge key={interest} tone="info">
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not listed.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
