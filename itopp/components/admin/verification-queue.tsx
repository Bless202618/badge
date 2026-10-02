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
import { useStore } from "@/lib/mock-store";

export function VerificationQueue() {
  const {
    currentUser,
    data,
    reviewStudent,
    reviewCompany,
  } = useStore();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectKind, setRejectKind] = useState<"student" | "company" | null>(
    null
  );
  const [reason, setReason] = useState("");

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          Log in as the admin to review verifications.
        </CardContent>
      </Card>
    );
  }
  if (currentUser.role !== "admin") {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          Only the platform admin can review verifications. You are logged in
          as a {currentUser.role}.
        </CardContent>
      </Card>
    );
  }

  const pendingStudents = data.studentProfiles.filter(
    (p) => p.verificationStatus === "pending"
  );
  const pendingCompanies = data.companyProfiles.filter(
    (p) => p.verificationStatus === "pending"
  );
  const decided = [
    ...data.studentProfiles
      .filter((p) => p.verificationStatus !== "pending")
      .map((p) => ({ kind: "Student" as const, name: p.name, p })),
    ...data.companyProfiles
      .filter((p) => p.verificationStatus !== "pending")
      .map((p) => ({ kind: "Company" as const, name: p.companyName, p })),
  ];

  function approve(kind: "student" | "company", userId: string, name: string) {
    if (kind === "student") reviewStudent(userId, "verified");
    else reviewCompany(userId, "verified");
    toast.success(`${name} verified.`);
  }

  function confirmReject() {
    if (!rejectId || !rejectKind) return;
    if (reason.trim().length < 3) {
      toast.error("Write a short reason so they know what to fix.");
      return;
    }
    if (rejectKind === "student") reviewStudent(rejectId, "rejected", reason.trim());
    else reviewCompany(rejectId, "rejected", reason.trim());
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
              items={pendingStudents.map((p) => ({
                id: p.userId,
                title: p.name,
                sub: `${p.department} · ${p.level} · CGPA ${p.cgpa} · ${p.skills.join(", ")}`,
                docs: `CV: ${p.cvName} · ID: ${p.idDocName}`,
              }))}
              kind="student"
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
              items={pendingCompanies.map((p) => ({
                id: p.userId,
                title: p.companyName,
                sub: `CAC ${p.cacNumber} · ${p.contactName} · ${p.phone} · ${p.website}`,
                docs: `Doc: ${p.docName}`,
              }))}
              kind="company"
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
            <Button variant="destructive" onClick={confirmReject}>
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
                  <TableRow key={`${d.kind}-${d.name}`}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.kind}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.p.verificationStatus} />
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
  onApprove,
  onAskReject,
}: {
  items: { id: string; title: string; sub: string; docs: string }[];
  kind: "student" | "company";
  onApprove: (kind: "student" | "company", userId: string, name: string) => void;
  onAskReject: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg border p-3">
          <b>{it.title}</b>
          <p className="text-sm text-[#6B7280]">{it.sub}</p>
          <p className="text-xs text-[#6B7280]">{it.docs}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => onApprove(kind, it.id, it.title)}>
              Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAskReject(it.id)}>
              Reject with reason
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
