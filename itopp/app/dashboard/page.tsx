import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyResponseDays } from "@/lib/response-time";
import {
  DashboardView,
  type DashboardStat,
} from "@/components/dashboard/dashboard-view";
import { PageHeader } from "@/components/layout/page-header";

export default async function DashboardPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <PageHeader eyebrow="DASHBOARD" title="Welcome" />
        <DashboardView data={null} />
      </main>
    );
  }

  const [studentProfile, companyProfile] = await Promise.all([
    me.role === "student"
      ? db.studentProfile.findUnique({ where: { userId: me.id } })
      : Promise.resolve(null),
    me.role === "company"
      ? db.companyProfile.findUnique({ where: { userId: me.id } })
      : Promise.resolve(null),
  ]);

  let stats: DashboardStat[] = [];
  if (me.role === "student") {
    const [activeApps, unread] = await Promise.all([
      db.application.count({
        where: {
          studentId: me.id,
          status: { in: ["applied", "shortlisted"] },
        },
      }),
      db.notification.count({ where: { userId: me.id, readAt: null } }),
    ]);
    stats = [
      { label: "Active applications", value: `${activeApps} / 5`, href: "/applications" },
      { label: "Unread notifications", value: String(unread), href: "/notifications" },
      {
        label: "Verification",
        value: me.status === "verified" ? "Done" : "Pending",
        href: "/student/profile",
      },
    ];
  } else if (me.role === "company") {
    const postings = await db.posting.findMany({
      where: { company: { userId: me.id } },
      select: { id: true, status: true },
    });
    const postingIds = postings.map((p) => p.id);
    const [applicants, responseDays] = await Promise.all([
      postingIds.length > 0
        ? db.application.count({ where: { postingId: { in: postingIds } } })
        : Promise.resolve(0),
      companyResponseDays(me.id),
    ]);
    stats = [
      {
        label: "Active openings",
        value: String(postings.filter((p) => p.status === "active").length),
        href: "/company/postings",
      },
      { label: "Total applicants", value: String(applicants), href: "/company/postings" },
      {
        label: "Avg response",
        value: responseDays === null ? "—" : `~${responseDays}d`,
        href: "/company/postings",
      },
    ];
  } else {
    const [pendingStudents, pendingCompanies, openReports] = await Promise.all([
      db.studentProfile.count({ where: { verificationStatus: "pending" } }),
      db.companyProfile.count({ where: { verificationStatus: "pending" } }),
      db.report.count({ where: { status: { in: ["open", "investigating"] } } }),
    ]);
    stats = [
      {
        label: "Pending reviews",
        value: String(pendingStudents + pendingCompanies),
        href: "/admin/queue",
      },
      { label: "Open reports", value: String(openReports), href: "/admin/reports" },
      { label: "Trust metrics", value: "View", href: "/admin/metrics" },
    ];
  }

  // Prisma relation: Posting.company -> CompanyProfile.
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <PageHeader eyebrow="DASHBOARD" title={`Hello, ${me.name.split(" ")[0]}`} />
      <DashboardView
        data={{
          user: {
            name: me.name,
            email: me.email,
            role: me.role,
            status:
              me.status === "suspended"
                ? "suspended"
                : me.status === "verified"
                  ? "verified"
                  : "pending",
          },
          studentProfile: studentProfile
            ? { reviewReason: studentProfile.reviewReason }
            : null,
          companyProfile: companyProfile
            ? { reviewReason: companyProfile.reviewReason }
            : null,
          stats,
        }}
      />
    </main>
  );
}
