import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostingForm } from "@/components/company/posting-form";

export default async function NewPostingPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "company") redirect("/dashboard");

  const profile = await db.companyProfile.findUnique({
    where: { userId: me.id },
  });
  if (!profile) redirect("/company/profile");
  if (profile.verificationStatus !== "verified") redirect("/company/postings");

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <PostingForm />
    </main>
  );
}
