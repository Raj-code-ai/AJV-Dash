"use client";

import { useEffect, useState } from "react";
import { FiEye, FiUsers } from "react-icons/fi";
import SectionHeading from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

interface VisitCounts {
  totalVisits: number;
  uniqueVisitors: number;
}

function formatCount(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export default function VisitorStatsSection() {
  const [counts, setCounts] = useState<VisitCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/visits", { credentials: "same-origin" });
        const json = await res.json();
        if (!cancelled && json?.success && json.data) {
          setCounts(json.data);
        }
      } catch {
        // leave empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function onUpdated(event: Event) {
      const detail = (event as CustomEvent<VisitCounts>).detail;
      if (detail && !cancelled) {
        setCounts(detail);
        setLoading(false);
      }
    }

    load();
    window.addEventListener("dept-visits-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("dept-visits-updated", onUpdated);
    };
  }, []);

  return (
    <section className="bg-academic-navy py-14 text-slate-200">
      <div className="container-page">
        <SectionHeading
          align="center"
          className="mb-10 [&_h2]:text-white [&_p]:text-slate-300"
          eyebrow="Community Reach"
          title="Website Visitors"
          description="Live count of people who have visited this department website."
        />

        {loading ? (
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Skeleton className="h-28 bg-white/10" />
            <Skeleton className="h-28 bg-white/10" />
          </div>
        ) : (
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Card className="flex items-center gap-4 border-white/10 bg-white/10 text-white shadow-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-academic-teal/20 text-teal-300">
                <FiEye className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  {formatCount(counts?.totalVisits ?? 0)}
                </p>
                <p className="text-sm text-slate-300">Total visits</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4 border-white/10 bg-white/10 text-white shadow-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-academic-teal/20 text-teal-300">
                <FiUsers className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-3xl font-semibold text-white">
                  {formatCount(counts?.uniqueVisitors ?? 0)}
                </p>
                <p className="text-sm text-slate-300">Unique visitors</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
