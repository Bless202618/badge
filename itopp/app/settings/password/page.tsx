import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export default async function PasswordPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Account settings</h1>
      <p className="text-sm text-[#6B7280]">Logged in as {me.email}</p>
      <ChangePasswordForm />
    </main>
  );
}
