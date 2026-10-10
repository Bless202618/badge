"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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

// Milestone map: which steps light up per status.
const STEPS = ["Applied", "Shortlisted", "Accepted"] as const;

function stepState(
  status: ApplicationRow["status"],
  step: (typeof STEPS)[number]
): "done" | "current" | "todo" | "dead" {
  if (status === "rejected" || status === "withdrawn") return "dead";
  const order = { applied: 0, shortlisted: 1, accepted: 2 } as const;
  const idx = order[status as "applied" | "shortlisted" | "accepted"];
  const sIdx = STEPS.indexOf(step);
  if (sIdx < idx) return "done";
  if (sIdx === idx) return status === "accepted" ? "done" : "current";
  return "todo";
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
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#64748B]">
        <b className="text-[#0B2E1F]">No applications yet</b>
        <br />
        Browse openings and send your first application.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <Card key={a.id}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-40 flex-1">
                <b>{a.postingTitle}</b>
                <p className="text-sm text-[#64748B]">
                  {a.companyName} · {a.daysPending} day
                  {a.daysPending === 1 ? "" : "s"} pending
                </p>
              </div>
              <StatusBadge status={a.status} />
            </div>

            <ol className="flex items-center gap-1">
              {STEPS.map((s, i) => {
                const st = stepState(a.status, s);
                return (
                  <li key={s} className="flex flex-1 items-center gap-1 last:flex-none">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                        st === "done"
                          ? "bg-[#0C6B3C] text-white"
                          : st === "current"
                            ? "bg-[#F5A623] text-white"
                            : st === "dead"
                              ? "bg-gray-200 text-[#64748B]"
                              : "bg-gray-200 text-[#64748B]"
                      }`}
                    >
                      {st === "done" ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className="hidden text-[11px] font-bold text-[#475569] sm:block">
                      {s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span
                        className={`mx-1 h-0.5 flex-1 rounded ${
                          st === "done" ? "bg-[#0C6B3C]" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>

            {a.status === "accepted" && !a.placementComplete && (
              <div className="rounded-xl bg-[#0A3B22] p-4 text-white">
                <p className="text-[11px] font-extrabold tracking-widest text-[#F5A623]">
                  PLACEMENT OFFER
                </p>
                <p className="mt-1 font-extrabold">
                  {a.postingTitle} — {a.companyName}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Accepted. The company will contact you off-app with reporting
                  details — interviews and onboarding happen outside this app.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
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
            </div>

            {a.placementComplete && (
              <RateForm
                applicationId={a.id}
                label={`Rate ${a.companyName}`}
                existingScore={a.myRating}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
