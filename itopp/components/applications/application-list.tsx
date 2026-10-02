"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { withdrawAction } from "@/lib/actions";
import { RateForm } from "@/components/ratings/rate-form";

export interface ApplicationRow {
  id: string;
  status: "applied" | "shortlisted" | "accepted" | "rejected" | "withdrawn";
  postingTitle: string;
  companyName: string;
  daysPending: number;
  active: boolean;
  placementComplete: boolean;
  myRating: number | null;
}

export function ApplicationList({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function withdraw(id: string) {
    setBusy(id);
    const res = await withdrawAction({ applicationId: id });
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else toast.success("Withdrawn — slot freed.");
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
        <b className="text-[#111827]">No applications yet</b>
        <br />
        Browse openings and send your first application.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <Card key={a.id}>
          <CardContent className="flex flex-wrap items-center gap-2 pt-4">
            <div className="min-w-48 flex-1">
              <b>{a.postingTitle}</b>
              <p className="text-sm text-[#6B7280]">
                {a.companyName} · {a.daysPending} day
                {a.daysPending === 1 ? "" : "s"} pending
              </p>
            </div>
            <StatusBadge status={a.status} />
            {a.active && (
              <Button
                size="sm"
                variant="outline"
                disabled={busy === a.id}
                onClick={() => withdraw(a.id)}
              >
                Withdraw
              </Button>
            )}
          {a.placementComplete && (
            <div className="w-full px-0 pt-2">
              <RateForm
                applicationId={a.id}
                label={`Rate ${a.companyName}`}
                existingScore={a.myRating}
              />
            </div>
          )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
