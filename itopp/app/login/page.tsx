import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Pick up where you left off — applications, openings, and verdicts waiting."
    >
      <LoginForm />
      <p className="mt-4 text-center text-sm text-[#475569]">
        No account yet?{" "}
        <Link href="/signup" className="font-bold text-[#0B5FFF] underline">
          Sign up free
        </Link>
      </p>
    </AuthShell>
  );
}
