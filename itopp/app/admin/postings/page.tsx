import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminPostingList } from "@/components/admin/admin-posting-list";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminPostingsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "admin") redirect("/dashboard");

  const postings = await db.posting.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <PageHeader
        eyebrow="ADMIN · SAFETY"
        title="All openings"
        description="Suspend scammy or rule-breaking openings. Suspended openings vanish from student feeds instantly."
      />
      <AdminPostingList
        postings={postings.map((p) => ({
          id: p.id,
          title: p.title,
          companyName: p.company.companyName,
          location: p.location,
          status: p.status,
          applicantCount: p._count.applications,
        }))}
      />
    </main>
  );
}
