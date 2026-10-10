import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Start your verified journey."
      subtitle="One account, one verification — then the whole placement loop opens up."
    >
      <SignupForm />
      <p className="mt-4 text-center text-sm text-[#475569]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[#0C6B3C] underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
