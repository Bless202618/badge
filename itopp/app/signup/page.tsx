import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <SignupForm />
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[#0B5FFF] underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
