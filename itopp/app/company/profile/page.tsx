import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CompanyProfileForm } from "@/components/company/company-profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { VerificationSteps } from "@/components/verification-steps";

export default async function CompanyProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "company") redirect("/dashboard");

  const existing = await db.companyProfile.findUnique({
    where: { userId: me.id },
  });
  const step =
    me.status === "verified" ? 3 : existing ? 2 : 1;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <PageHeader
        eyebrow="COMPANY VERIFICATION"
        title="Your company"
        description="Students see your name and openings — your CAC documents stay reviewer-only."
      />
      <VerificationSteps current={step} />
      <CompanyProfileForm
        initial={
          existing
            ? {
                companyName: existing.companyName,
                cacNumber: existing.cacNumber,
                contactName: existing.contactName,
                phone: existing.phone,
                website: existing.website,
                docName: existing.docName,
              }
            : null
        }
      />
    </main>
  );
}
