import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationList } from "@/components/applications/application-list";

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

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">My applications</h1>
        <span className="text-sm text-[#6B7280]">
          {active} / 5 active slots used
        </span>
      </div>
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
        }))}
      />
      <p className="text-sm">
        <Link href="/openings" className="font-bold text-[#0B5FFF] underline">
          ← Back to openings
        </Link>
      </p>
    </main>
  );
}
