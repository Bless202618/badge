import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentProfileForm } from "@/components/student/student-profile-form";

export default async function StudentProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student") redirect("/dashboard");

  const existing = await db.studentProfile.findUnique({
    where: { userId: me.id },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <StudentProfileForm
        userName={me.name}
        initial={
          existing
            ? {
                name: existing.name,
                department: existing.department,
                level: existing.level,
                cgpa: existing.cgpa,
                skills: existing.skills,
                cvName: existing.cvName,
                idDocName: existing.idDocName,
              }
            : null
        }
      />
    </main>
  );
}
