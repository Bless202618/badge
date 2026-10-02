import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicantCard } from "@/components/company/applicant-card";
import { companyResponseDays } from "@/lib/response-time";

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "company") redirect("/dashboard");

  const profile = await db.companyProfile.findUnique({
    where: { userId: me.id },
  });
  if (!profile) redirect("/company/profile");

  const posting = await db.posting.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
        include: { student: { include: { studentProfile: true } } },
      },
    },
  });
  if (!posting || posting.companyId !== profile.id) notFound();

  const myRatings = await db.rating.findMany({
    where: {
      applicationId: { in: posting.applications.map((a) => a.id) },
      fromId: me.id,
    },
  });
  const myRatingMap = new Map(myRatings.map((r) => [r.applicationId, r.score]));

  const now = Date.now();
  const responseDays = await companyResponseDays(me.id);

  // Average rating each applicant received (reliability signal).
  const studentIds = posting.applications.map((a) => a.studentId);
  const avgs = await db.rating.groupBy({
    by: ["toId"],
    where: { toId: { in: studentIds } },
    _avg: { score: true },
  });
  const avgMap = new Map(avgs.map((a) => [a.toId, a._avg.score ?? null]));

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Applicants — {posting.title}</h1>
      <p className="text-sm text-[#6B7280]">
        {posting.applications.length} total · You typically respond in{" "}
        {responseDays === null ? "— (no decisions yet)" : `~${responseDays} day(s)`}
      </p>
      <div className="space-y-3">
        {posting.applications.length === 0 && (
          <p className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-[#6B7280]">
            No applications yet. Students see this opening in their feed.
          </p>
        )}
        {posting.applications.map((a) => {
          const sp = a.student.studentProfile;
          return (
            <ApplicantCard
              key={a.id}
              app={{
                id: a.id,
                status: a.status,
                placementComplete: a.placementComplete,
                daysPending: Math.max(
                  0,
                  Math.floor((now - a.createdAt.getTime()) / 86400000)
                ),
                answers: Array.isArray(a.answers)
                  ? (a.answers as { question: string; answer: string }[])
                  : [],
                studentName: sp?.name ?? a.student.name,
                department: sp?.department ?? "—",
                level: sp?.level ?? "—",
                cgpa: sp?.cgpa ?? 0,
                skills: sp?.skills ?? [],
                cvName: sp?.cvName ?? null,
                myRating: myRatingMap.get(a.id) ?? null,
                studentAvg: avgMap.get(a.studentId) ?? null,
              }}
            />
          );
        })}
      </div>
    </main>
  );
}
