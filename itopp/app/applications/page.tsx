import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationList } from "@/components/applications/application-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function ApplicationsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student") redirect("/dashboard");

  const apps = await db.application.findMany({
    where: { studentId: me.id },
    orderBy: { createdAt: "desc" },
    include: { posting: { include: { company: true } } },
  });

  const now = Date.now();
  const active = apps.filter(
    (a) => a.status === "applied" || a.status === "shortlisted"
  ).length;

  const myRatings = await db.rating.findMany({
    where: { applicationId: { in: apps.map((a) => a.id) }, fromId: me.id },
  });
  const myRatingMap = new Map(myRatings.map((r) => [r.applicationId, r.score]));

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <PageHeader
        eyebrow="TRACKING"
        title="My applications"
        description={`${active} of 5 active slots used — withdrawing frees a slot.`}
      />
      <ApplicationList
        applications={apps.map((a) => ({
          id: a.id,
          status: a.status,
          postingTitle: a.posting.title,
          companyName: a.posting.company.companyName,
          daysPending: Math.max(
            0,
            Math.floor((now - a.createdAt.getTime()) / 86400000)
          ),
          active: a.status === "applied" || a.status === "shortlisted",
          placementComplete: a.placementComplete,
          myRating: myRatingMap.get(a.id) ?? null,
        }))}
      />
      <p className="text-sm">
        <Link href="/openings" className="font-bold text-[#0C6B3C] underline">
          ← Back to openings
        </Link>
      </p>
    </main>
  );
}
