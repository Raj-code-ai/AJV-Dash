"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import type { Faculty } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

export default function FacultyDirectory({ faculty }: { faculty: Faculty[] }) {
  const [q, setQ] = useState("");
  const [designation, setDesignation] = useState("");

  const designations = useMemo(() => {
    const set = new Set(faculty.map((f) => f.designation).filter(Boolean));
    return Array.from(set).sort();
  }, [faculty]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return faculty.filter((f) => {
      const matchesQ =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.designation.toLowerCase().includes(query) ||
        f.researchInterests.some((r) => r.toLowerCase().includes(query));
      const matchesDes = !designation || f.designation === designation;
      return matchesQ && matchesDes;
    });
  }, [faculty, q, designation]);

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-[1fr_240px]">
        <Input
          placeholder="Search by name, designation, or research..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="All designations"
          options={designations.map((d) => ({ value: d, label: d }))}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No faculty found"
          description="Try a different search or filter."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <Card
              key={member._id}
              className="h-full transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <Link href={`/faculty/${member._id}`} className="block">
                <div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={member.photoUrl}
                    alt={member.name}
                    fill
                    unoptimized={member.photoUrl.startsWith("/")}
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <p className="mt-1 text-sm font-medium text-academic-teal">
                  {member.designation}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                  {member.qualification}
                </p>
              </Link>
              {(member.linkedinUrl || member.githubUrl) && (
                <div className="mt-4 flex items-center gap-2">
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#0A66C2] transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-white/10"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <FaLinkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-white/10"
                      aria-label={`${member.name} GitHub`}
                    >
                      <FaGithub className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
