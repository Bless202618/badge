import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function AdminMetricsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/dashboard");

  const [
    verifiedCompanies,
    verifiedStudents,
    totalApps,
    shortlistedPlus,
    accepted,
    reports,
    resolvedReports,
  ] = await Promise.all([
    db.user.count({ where: { role: "company", status: "verified" } }),
    db.user.count({ where: { role: "student", status: "verified" } }),
    db.application.count({ where: { status: { not: "withdrawn" } } }),
    db.application.count({
      where: { status: { in: ["shortlisted", "accepted"] } },
    }),
    db.application.count({ where: { status: "accepted" } }),
    db.report.count(),
    db.report.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    }),
  ]);

  const pct = (n: number) =>
    totalApps === 0 ? "—" : `${Math.round((100 * n) / totalApps)}%`;

  const resolutionHours = resolvedReports
    .map((r) => r.resolvedAt!.getTime() - r.createdAt.getTime())
    .sort((a, b) => a - b);
  const medianResolution =
    resolutionHours.length === 0
      ? "—"
      : `${Math.round(resolutionHours[Math.floor(resolutionHours.length / 2)] / 3600000)}h`;

  const cards: [string, string][] = [
    ["Verified companies with access", String(verifiedCompanies)],
    ["Verified students with profiles", String(verifiedStudents)],
    ["Application → shortlist", pct(shortlistedPlus)],
    ["Application → placement", pct(accepted)],
    ["Reports filed", String(reports)],
    ["Median report resolution", medianResolution],
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Trust metrics</h1>
      <p className="text-sm text-[#6B7280]">
        The 5 PRD success metrics + report health. Pilot target: 15–20
        companies, one student cohort.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-[#6B7280]">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-extrabold">{value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
