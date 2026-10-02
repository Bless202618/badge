import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
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

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <DashboardView
        data={{
          user: {
            name: me.name,
            email: me.email,
            role: me.role,
            status: me.status === "suspended" ? "suspended" : me.status === "verified" ? "verified" : "pending",
          },
          studentProfile: studentProfile
            ? { reviewReason: studentProfile.reviewReason }
            : null,
          companyProfile: companyProfile
            ? { reviewReason: companyProfile.reviewReason }
            : null,
        }}
      />
    </main>
  );
}
