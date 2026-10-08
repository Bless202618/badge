import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  VerificationQueue,
  type DecidedItem,
} from "@/components/admin/verification-queue";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminQueuePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/dashboard");

  const [pendingStudents, pendingCompanies, doneStudents, doneCompanies] =
    await Promise.all([
      db.studentProfile.findMany({
        where: { verificationStatus: "pending" },
        orderBy: { createdAt: "asc" },
      }),
      db.companyProfile.findMany({
        where: { verificationStatus: "pending" },
        orderBy: { createdAt: "asc" },
      }),
      db.studentProfile.findMany({
        where: { verificationStatus: { not: "pending" } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
      db.companyProfile.findMany({
        where: { verificationStatus: { not: "pending" } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      }),
    ]);

  const decided: DecidedItem[] = [
    ...doneStudents.map((p) => ({
      key: `s-${p.id}`,
      name: p.name,
      kind: "Student",
      status: p.verificationStatus as DecidedItem["status"],
    })),
    ...doneCompanies.map((p) => ({
      key: `c-${p.id}`,
      name: p.companyName,
      kind: "Company",
      status: p.verificationStatus as DecidedItem["status"],
    })),
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <PageHeader
        eyebrow="ADMIN · TRUST GATE"
        title="Verification queue"
        description="You are the sole verifier. Approve real accounts, reject with a clear reason so they can fix and resubmit."
      />
      <VerificationQueue
        pendingStudents={pendingStudents.map((p) => ({
          userId: p.userId,
          title: p.name,
          sub: `${p.department} · ${p.level} · CGPA ${p.cgpa} · ${p.skills.join(", ")}`,
          docs: `CV: ${p.cvName ?? "—"} · ID: ${p.idDocName ?? "—"}`,
        }))}
        pendingCompanies={pendingCompanies.map((p) => ({
          userId: p.userId,
          title: p.companyName,
          sub: `CAC ${p.cacNumber} · ${p.contactName} · ${p.phone} · ${p.website}`,
          docs: `Doc: ${p.docName ?? "—"}`,
        }))}
        decided={decided}
      />
    </main>
  );
}
