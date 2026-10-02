"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { setPostingStatusAction } from "@/lib/actions";

export interface PostingRow {
  id: string;
  title: string;
  location: string;
  durationMonths: number;
  status: "draft" | "active" | "closed" | "suspended";
  departments: string[];
  applicantCount: number;
  createdAt: string;
}

export function PostingList({ postings }: { postings: PostingRow[] }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function flip(id: string, status: "active" | "closed") {
    setBusy(id);
    const res = await setPostingStatusAction({ id, status });
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else toast.success(status === "closed" ? "Opening closed." : "Opening reopened.");
  }

  if (postings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
        <b className="text-[#111827]">No openings yet</b>
        <br />
        Publish your first opening — quick post takes under a minute.
      </div>
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
                {p.location} · {p.durationMonths} months ·{" "}
                {p.departments.join(", ")} · {p.applicantCount} applicant
                {p.applicantCount === 1 ? "" : "s"}
              </p>
            </div>
            <StatusBadge
              status={
                p.status === "active"
                  ? "accepted"
                  : p.status === "closed"
                    ? "closed"
                    : "suspended"
              }
            />
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/company/postings/${p.id}/edit`}>Edit</Link>}
            />
            {p.status === "active" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy === p.id}
                onClick={() => flip(p.id, "closed")}
              >
                Close
              </Button>
            ) : p.status === "closed" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={busy === p.id}
                onClick={() => flip(p.id, "active")}
              >
                Reopen
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
