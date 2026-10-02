import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        No account yet?{" "}
        <Link href="/signup" className="font-bold text-[#0B5FFF] underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
