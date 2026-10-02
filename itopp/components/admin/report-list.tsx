"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { resolveReportAction } from "@/lib/actions";

export interface ReportRow {
  id: string;
  companyName: string;
  reporterName: string;
  reason: string;
  details: string | null;
  status: string;
  when: string;
}

const STATUS_LABEL: Record<string, "pending" | "verified" | "rejected"> = {
  open: "pending",
  investigating: "pending",
  resolved: "verified",
  dismissed: "rejected",
};

export function ReportList({ reports }: { reports: ReportRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [suspend, setSuspend] = useState<Record<string, boolean>>({});

  async function resolve(id: string, outcome: "resolved" | "dismissed") {
    setBusy(id);
    const res = await resolveReportAction({
      reportId: id,
      outcome,
      suspendCompany: suspend[id] ?? false,
    });
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else toast.success(`Report ${outcome}. Reporter notified.`);
  }

  const open = reports.filter((r) => r.status === "open" || r.status === "investigating");
  const done = reports.filter((r) => r.status !== "open" && r.status !== "investigating");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Needs your review — 48h SLA ({open.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {open.length === 0 && (
            <p className="text-sm text-[#6B7280]">Queue clear. Good.</p>
          )}
          {open.map((r) => (
            <div key={r.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <b>{r.companyName}</b>
                <StatusBadge status={STATUS_LABEL[r.status] ?? "pending"} />
                <span className="flex-1" />
                <span className="text-xs text-[#6B7280]">{r.when}</span>
              </div>
              <p className="text-sm">
                <b>{r.reason}</b> — reported by {r.reporterName}
              </p>
              {r.details && (
                <p className="text-sm text-[#374151]">“{r.details}”</p>
              )}
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={suspend[r.id] ?? false}
                  onChange={(e) =>
                    setSuspend({ ...suspend, [r.id]: e.target.checked })
                  }
                />
                Also suspend company + freeze its openings
              </label>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  disabled={busy === r.id}
                  onClick={() => resolve(r.id, "resolved")}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === r.id}
                  onClick={() => resolve(r.id, "dismissed")}
                >
                  Dismiss (no violation)
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Handled ({done.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {done.map((r) => (
              <div key={r.id} className="flex flex-wrap gap-2 border-b py-2">
                <b>{r.companyName}</b>
                <span className="text-[#6B7280]">{r.reason}</span>
                <span className="flex-1" />
                <StatusBadge status={STATUS_LABEL[r.status] ?? "pending"} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
