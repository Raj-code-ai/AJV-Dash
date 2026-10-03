"use client";

import { useEffect } from "react";

/**
 * Records one site visit per browser session (and unique visitor once).
 * Mounted in the public layout so every public page counts.
 */
export default function VisitTracker() {
  useEffect(() => {
    const key = "dept_visit_tracked";
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");

    void fetch("/api/visits", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (json?.success && json.data) {
          window.dispatchEvent(
            new CustomEvent("dept-visits-updated", { detail: json.data })
          );
        }
      })
      .catch(() => {
        sessionStorage.removeItem(key);
      });
  }, []);

  return null;
}
