"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { setPostingStatusAction } from "@/lib/actions";

export interface AdminPostingRow {
  id: string;
  title: string;
  companyName: string;
  location: string;
  status: "draft" | "active" | "closed" | "suspended";
  applicantCount: number;
}

export function AdminPostingList({ postings }: { postings: AdminPostingRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function set(id: string, status: "active" | "suspended", label: string) {
    setBusy(id);
    const res = await setPostingStatusAction({ id, status });
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else toast.success(label);
  }

  if (postings.length === 0) {
    return (
      <p className="text-sm text-[#6B7280]">
        No openings published yet. They appear here once companies post.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {postings.map((p) => (
        <Card key={p.id}>
          <CardContent className="flex flex-wrap items-center gap-2 pt-4">
            <div className="min-w-48 flex-1">
              <b>{p.title}</b>
              <p className="text-sm text-[#6B7280]">
                {p.companyName} · {p.location} · {p.applicantCount} applicant
                {p.applicantCount === 1 ? "" : "s"}
              </p>
            </div>
            <StatusBadge
              status={
                p.status === "active"
                  ? "accepted"
                  : p.status === "suspended"
                    ? "suspended"
                    : "closed"
              }
            />
            {p.status === "suspended" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy === p.id}
                onClick={() => set(p.id, "active", "Opening restored.")}
              >
                Restore
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                disabled={busy === p.id}
                onClick={() => set(p.id, "suspended", "Opening suspended.")}
              >
                Suspend
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
