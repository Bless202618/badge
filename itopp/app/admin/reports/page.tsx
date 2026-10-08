import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReportList } from "@/components/admin/report-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminReportsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/dashboard");

  const reports = await db.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { reporter: true },
  });
  const companies = await db.companyProfile.findMany({
    where: { id: { in: reports.map((r) => r.companyId) } },
  });
  const nameMap = new Map(companies.map((c) => [c.id, c.companyName]));

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <PageHeader
        eyebrow="ADMIN · SAFETY"
        title="Reports"
        description="Every report gets an answer within 48 hours: investigate, suspend, or delist. The reporter is notified either way."
      />
      <ReportList
        reports={reports.map((r) => ({
          id: r.id,
          companyName: nameMap.get(r.companyId) ?? "Unknown company",
          reporterName: r.reporter.name,
          reason: r.reason,
          details: r.details,
          status: r.status,
          when: r.createdAt.toLocaleString(),
        }))}
      />
    </main>
  );
}
