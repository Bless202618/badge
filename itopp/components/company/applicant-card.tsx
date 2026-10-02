"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  completePlacementAction,
  setApplicationStatusAction,
} from "@/lib/actions";
import { RateForm } from "@/components/ratings/rate-form";

export interface Applicant {
  id: string;
  status: "applied" | "shortlisted" | "accepted" | "rejected" | "withdrawn";
  placementComplete: boolean;
  daysPending: number;
  answers: { question: string; answer: string }[];
  studentName: string;
  department: string;
  level: string;
  cgpa: number;
  skills: string[];
  cvName: string | null;
  myRating: number | null;
  studentAvg: number | null;
}

export function ApplicantCard({ app }: { app: Applicant }) {
  const [busy, setBusy] = useState(false);

  async function setStatus(status: "shortlisted" | "accepted" | "rejected") {
    setBusy(true);
    const res = await setApplicationStatusAction({
      applicationId: app.id,
      status,
    });
    setBusy(false);
    if (!res.ok) toast.error(res.error);
    else toast.success(`Applicant ${status}. Student notified.`);
  }

  async function complete() {
    setBusy(true);
    const res = await completePlacementAction({ applicationId: app.id });
    setBusy(false);
    if (!res.ok) toast.error(res.error);
    else toast.success("Placement marked complete. Ratings unlocked.");
  }

  const pending = app.status === "applied" || app.status === "shortlisted";

  return (
    <Card>
      <CardContent className="space-y-2 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <b>{app.studentName}</b>
          <StatusBadge status={app.status} />
          {app.placementComplete && (
            <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
              Placement complete
            </span>
          )}
          <span className="flex-1" />
          <span className="text-xs text-[#6B7280]">
            {app.daysPending}d pending
          </span>
        </div>
        <p className="text-sm text-[#6B7280]">
          {app.department} · {app.level} · CGPA {app.cgpa} · Skills:{" "}
          {app.skills.join(", ") || "—"} · CV: {app.cvName ?? "—"}
          {app.studentAvg !== null && ` · Rated ${app.studentAvg}/5 avg`}
        </p>
        {app.answers.length > 0 && (
          <details className="rounded-md bg-gray-50 p-2 text-sm">
            <summary className="cursor-pointer font-semibold">
              Screening answers ({app.answers.length})
            </summary>
            <div className="mt-2 space-y-2">
              {app.answers.map((a, i) => (
                <div key={i}>
                  <b>
                    {i + 1}. {a.question}
                  </b>
                  <p className="text-[#374151]">{a.answer || "—"}</p>
                </div>
              ))}
            </div>
          </details>
        )}
        {pending && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setStatus("shortlisted")}
            >
              Shortlist
            </Button>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => setStatus("accepted")}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => setStatus("rejected")}
            >
              Reject
            </Button>
          </div>
        )}
        {app.status === "accepted" && !app.placementComplete && (
          <Button size="sm" disabled={busy} onClick={complete}>
            Mark placement complete
          </Button>
        )}
        {app.placementComplete && (
          <RateForm
            applicationId={app.id}
            label="Rate this student"
            existingScore={app.myRating}
          />
        )}
      </CardContent>
    </Card>
  );
}
