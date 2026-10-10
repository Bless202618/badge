import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostingForm } from "@/components/company/posting-form";

export default async function EditPostingPage({
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

  const posting = await db.posting.findUnique({ where: { id } });
  if (!posting || posting.companyId !== profile.id) notFound();

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <PostingForm
        initial={{
          id: posting.id,
          title: posting.title,
          departments: posting.departments,
          location: posting.location,
          durationMonths: posting.durationMonths,
          skillsRequired: posting.skillsRequired,
          customQuestions: Array.isArray(posting.customQuestions)
            ? (posting.customQuestions as string[])
            : [],
          hasStipend: posting.hasStipend,
        }}
      />
    </main>
  );
}
