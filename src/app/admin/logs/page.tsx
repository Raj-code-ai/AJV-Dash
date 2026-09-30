"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiGet, formatDateTime } from "@/lib/fetchers";
import type { ActivityLog } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    const res = await apiGet<ActivityLog[]>(
      `/api/admin/logs?page=${p}&limit=20`
    );
    if (res.success && res.data) {
      setLogs(res.data);
      setTotalPages(Number(res.meta?.totalPages) || 1);
      setPage(Number(res.meta?.page) || p);
    } else {
      toast.error(res.error || "Failed to load logs");
    }
    setLoading(false);
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-academic-navy dark:text-white">
          Activity Logs
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Audit trail of admin actions and contact submissions. Super Admin only.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <>
          <Card className="overflow-x-auto !p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const user =
                    typeof log.user === "object" && log.user
                      ? log.user
                      : null;
                  return (
                    <tr
                      key={log._id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {user ? (
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="info">{log.action}</Badge>
                      </td>
                      <td className="px-4 py-3">{log.entity}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-600 dark:text-slate-300">
                        {log.details || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => load(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => load(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
