"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";
import type { Achievement } from "@/types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/fetchers";
import Button from "@/components/ui/Button";

export default function AchievementsBrowser({
  achievements,
  years,
  initialYear,
  initialCategory,
  initialQ,
}: {
  achievements: Achievement[];
  years: number[];
  initialYear: string;
  initialCategory: string;
  initialQ: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function applyFilters(form: HTMLFormElement) {
    const data = new FormData(form);
    const params = new URLSearchParams();
    const year = String(data.get("year") || "");
    const category = String(data.get("category") || "");
    const q = String(data.get("q") || "").trim();
    if (year) params.set("year", year);
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div>
      <form
        className="mb-8 grid gap-4 md:grid-cols-[1fr_160px_180px_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters(e.currentTarget);
        }}
      >
        <Input
          name="q"
          defaultValue={initialQ}
          placeholder="Search achievements..."
        />
        <Select
          name="year"
          defaultValue={initialYear}
          placeholder="All years"
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
        />
        <Select
          name="category"
          defaultValue={initialCategory}
          placeholder="All categories"
          options={[
            { value: "student", label: "Student" },
            { value: "faculty", label: "Faculty" },
            { value: "department", label: "Department" },
          ]}
        />
        <Button type="submit">Filter</Button>
      </form>

      {achievements.length === 0 ? (
        <EmptyState title="No achievements found" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((item) => (
            <Card key={item._id} className="overflow-hidden !p-0">
              {item.imageUrl && (
                <div className="relative h-44 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="info" className="capitalize">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatDate(item.date)} · {item.year}
                  </span>
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription className="line-clamp-4">
                  {item.description}
                </CardDescription>
                {item.certificateUrl && (
                  <a
                    href={item.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-academic-teal"
                  >
                    View certificate <FiExternalLink />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
