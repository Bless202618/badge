import Link from "next/link";
import { ShieldCheck, Search, Bell } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 lg:grid-cols-2 lg:items-center">
      <div className="hidden rounded-2xl bg-[#0A1633] p-8 text-white lg:block">
        <Link href="/" className="text-xl font-extrabold">
          ITopp
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold leading-tight">
          {title}
        </h2>
        <p className="mt-2 text-white/70">{subtitle}</p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#4ADE80]" />
            <span>
              <b>Verified community.</b> Every account passes a human document
              check.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Search className="mt-0.5 size-5 shrink-0 text-[#9DBCFF]" />
            <span>
              <b>Matched openings.</b> Best fits ranked first, with reasons
              shown.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Bell className="mt-0.5 size-5 shrink-0 text-[#FBBF24]" />
            <span>
              <b>Never ghosted.</b> Every status change lands in your inbox.
            </span>
          </li>
        </ul>
      </div>
      <div>{children}</div>
    </main>
  );
}
