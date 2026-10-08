import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostingList } from "@/components/company/posting-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function CompanyPostingsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "company") redirect("/dashboard");

  const profile = await db.companyProfile.findUnique({
    where: { userId: me.id },
  });
  if (!profile) redirect("/company/profile");

  const postings = await db.posting.findMany({
    where: { companyId: profile.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <PageHeader
        eyebrow="COMPANY · HIRING"
        title="My openings"
        description="Publish once — matched students find you. Close when the slot fills."
      />
      <div>
        <Button nativeButton={false} render={<Link href="/company/postings/new">+ New opening</Link>} />
      </div>
      {profile.verificationStatus !== "verified" && (
        <p className="rounded-lg bg-[#FEF3C7] p-3 text-sm">
          Your company is not verified yet — publishing unlocks after approval.
          Your drafts below stay hidden until then.
        </p>
      )}
      <PostingList
        postings={postings.map((p) => ({
          id: p.id,
          title: p.title,
          location: p.location,
          durationMonths: p.durationMonths,
          status: p.status,
          departments: p.departments,
          applicantCount: p._count.applications,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
