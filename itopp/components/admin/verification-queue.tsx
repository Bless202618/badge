"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { reviewCompanyAction, reviewStudentAction } from "@/lib/actions";

export interface PendingItem {
  userId: string;
  title: string;
  sub: string;
  docs: string;
}

export interface DecidedItem {
  key: string;
  name: string;
  kind: string;
  status: "pending" | "verified" | "rejected" | "suspended";
}

export function VerificationQueue({
  pendingStudents,
  pendingCompanies,
  decided,
}: {
  pendingStudents: PendingItem[];
  pendingCompanies: PendingItem[];
  decided: DecidedItem[];
}) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectKind, setRejectKind] = useState<"student" | "company" | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function approve(
    kind: "student" | "company",
    userId: string,
    name: string
  ) {
    setBusy(true);
    const res =
      kind === "student"
        ? await reviewStudentAction({ userId, decision: "verified" })
        : await reviewCompanyAction({ userId, decision: "verified" });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`${name} verified.`);
  }

  async function confirmReject() {
    if (!rejectId || !rejectKind) return;
    if (reason.trim().length < 3) {
      toast.error("Write a short reason so they know what to fix.");
      return;
    }
    setBusy(true);
    const res =
      rejectKind === "student"
        ? await reviewStudentAction({
            userId: rejectId,
            decision: "rejected",
            reason: reason.trim(),
          })
        : await reviewCompanyAction({
            userId: rejectId,
            decision: "rejected",
            reason: reason.trim(),
          });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Rejection sent with reason.");
    setRejectId(null);
    setRejectKind(null);
    setReason("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Pending student verifications ({pendingStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingStudents.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Nothing waiting. Good.</p>
          ) : (
            <Rows
              items={pendingStudents}
              kind="student"
              busy={busy}
              onApprove={approve}
              onAskReject={(id) => {
                setRejectId(id);
                setRejectKind("student");
                setReason("");
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Pending company verifications ({pendingCompanies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingCompanies.length === 0 ? (
            <p className="text-sm text-[#6B7280]">Nothing waiting. Good.</p>
          ) : (
            <Rows
              items={pendingCompanies}
              kind="company"
              busy={busy}
              onApprove={approve}
              onAskReject={(id) => {
                setRejectId(id);
                setRejectKind("company");
                setReason("");
              }}
            />
          )}
        </CardContent>
      </Card>

      {rejectId && (
        <Card>
          <CardHeader>
            <CardTitle>Reject with a reason</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="e.g. School ID photo is blurry — re-upload a clear copy"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={busy}
            >
              Send rejection
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setRejectKind(null);
              }}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}

      {decided.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Decided ({decided.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decided.map((d) => (
                  <TableRow key={d.key}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.kind}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Rows({
  items,
  kind,
  busy,
  onApprove,
  onAskReject,
}: {
  items: PendingItem[];
  kind: "student" | "company";
  busy: boolean;
  onApprove: (
    kind: "student" | "company",
    userId: string,
    name: string
  ) => void;
  onAskReject: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.userId} className="rounded-lg border p-3">
          <b>{it.title}</b>
          <p className="text-sm text-[#6B7280]">{it.sub}</p>
          <p className="text-xs text-[#6B7280]">{it.docs}</p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => onApprove(kind, it.userId, it.title)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onAskReject(it.userId)}
            >
              Reject with reason
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
