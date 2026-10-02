import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchScore } from "@/lib/match";
import { ApplyForm } from "@/components/openings/apply-form";
import { ReportDialog } from "@/components/reports/report-dialog";

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getSessionUser();

  const posting = await db.posting.findUnique({
    where: { id },
    include: { company: { include: { user: true } } },
  });
  if (
    !posting ||
    posting.status !== "active" ||
    posting.company.verificationStatus !== "verified" ||
    posting.company.user.status !== "verified"
  ) {
    notFound();
  }

  const profile =
    me?.role === "student"
      ? await db.studentProfile.findUnique({ where: { userId: me.id } })
      : null;

  const match = profile
    ? matchScore(
        { department: profile.department, skills: profile.skills },
        { departments: posting.departments, skillsRequired: posting.skillsRequired }
      )
    : null;

  const questions = Array.isArray(posting.customQuestions)
    ? (posting.customQuestions as string[])
    : [];

  const existing =
    me?.role === "student"
      ? await db.application.findFirst({
          where: {
            postingId: posting.id,
            studentId: me.id,
            status: { in: ["applied", "shortlisted"] },
          },
        })
      : null;

  const canApply =
    me?.role === "student" && me.status === "verified" && !existing;

  const companyAvg = await db.rating.aggregate({
    where: { toId: posting.company.userId },
    _avg: { score: true },
    _count: true,
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl">{posting.title}</CardTitle>
            <StatusBadge status="verified" />
          </div>
          <p className="text-sm text-[#6B7280]">
            {posting.company.companyName} · {posting.location} ·{" "}
            {posting.durationMonths} months
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <b>Departments:</b> {posting.departments.join(", ")}
          </div>
          <div>
            <b>Skills wanted:</b>{" "}
            {posting.skillsRequired.length > 0
              ? posting.skillsRequired.join(", ")
              : "Open to all skills"}
          </div>
          <div>
            <b>Contact:</b> {posting.company.contactName} ·{" "}
            {posting.company.phone} · {posting.company.website}
          </div>
          {match && (
            <div className="flex flex-wrap gap-1.5">
              {match.reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#0B5FFF]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
          <p className="rounded-md bg-[#F3F4F6] p-3 text-xs text-[#6B7280]">
            Interviews happen off-app: shortlisted students are contacted by
            the company directly.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-sm">
              Company rating:{" "}
              <b>
                {companyAvg._count > 0
                  ? `${companyAvg._avg.score?.toFixed(1)}/5 (${companyAvg._count})`
                  : "No ratings yet"}
              </b>
            </span>
            <span className="flex-1" />
            {me && (
              <ReportDialog
                companyId={posting.company.id}
                postingId={posting.id}
                companyName={posting.company.companyName}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {existing ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-2 pt-4 text-sm">
            <span>
              You applied — status: <StatusBadge status={existing.status} />
            </span>
            <Link
              href="/applications"
              className="font-bold text-[#0B5FFF] underline"
            >
              Track it
            </Link>
          </CardContent>
        </Card>
      ) : canApply ? (
        <ApplyForm postingId={posting.id} questions={questions} />
      ) : me?.role === "student" ? (
        <Card>
          <CardContent className="pt-4 text-sm">
            Get verified to apply — complete your{" "}
            <Link
              href="/student/profile"
              className="font-bold text-[#0B5FFF] underline"
            >
              student profile
            </Link>{" "}
            first.
          </CardContent>
        </Card>
      ) : me ? (
        <Card>
          <CardContent className="pt-4 text-sm">
            Company and admin accounts cannot apply to openings.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 text-sm">
            <Link href="/login" className="font-bold text-[#0B5FFF] underline">
              Log in
            </Link>{" "}
            as a verified student to apply.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
