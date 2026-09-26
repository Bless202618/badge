import Link from "next/link";
import { ShieldCheck, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <p className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#16A34A]">
        VERIFIED IT PLACEMENTS
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight">
        ITopp — real openings,
        <br />
        zero guesswork.
      </h1>
      <p className="max-w-md text-[#6B7280]">
        Verified companies meet verified 400-level students. Matched discovery,
        structured applications, and clear status tracking — Applied →
        Shortlisted → Accepted.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/design">View design system</Link>} />
        <Button
          variant="outline"
          render={<Link href="/design">Browse openings</Link>}
        />
      </div>
      <div className="grid w-full gap-3 text-left sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <ShieldCheck className="mb-2 size-5 text-[#16A34A]" />
          <b className="text-sm">Verified both sides</b>
          <p className="text-xs text-[#6B7280]">
            Manual company + student checks before anyone posts or applies.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <Search className="mb-2 size-5 text-[#0B5FFF]" />
          <b className="text-sm">Matched first</b>
          <p className="text-xs text-[#6B7280]">
            Best-fit openings ranked top, full browse below.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <Bell className="mb-2 size-5 text-[#D97706]" />
          <b className="text-sm">Always in the loop</b>
          <p className="text-xs text-[#6B7280]">
            Status changes, new matches, report updates — max 5 active
            applications.
          </p>
        </div>
      </div>
    </main>
  );
}
