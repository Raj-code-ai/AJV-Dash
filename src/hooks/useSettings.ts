"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/fetchers";
import type { SiteSettings } from "@/types";

const fallback: Partial<SiteSettings> = {
  universityName: "University",
  departmentName: "Department",
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const res = await apiGet<SiteSettings>("/api/settings");
        if (!active) return;

        if (res.success && res.data) {
          setSettings(res.data);
          setError(null);
        } else {
          setSettings(fallback as SiteSettings);
          setError(res.error || "Failed to load settings");
        }
      } catch {
        if (!active) return;
        setSettings(fallback as SiteSettings);
        setError("Failed to load settings");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, error, setSettings };
}
