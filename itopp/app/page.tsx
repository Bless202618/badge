import Link from "next/link";
import {
  Bell,
  Search,
  ShieldCheck,
  ArrowRight,
  Building2,
  GraduationCap,
  ClipboardCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa/install-button";
import { db } from "@/lib/db";

export default async function Home() {
  const [companies, students, openings] = await Promise.all([
    db.user.count({ where: { role: "company", status: "verified" } }),
    db.user.count({ where: { role: "student", status: "verified" } }),
    db.posting.count({ where: { status: "active" } }),
  ]);

  const stats: [string, string][] = [
    [String(companies), "verified companies"],
    [String(students), "verified students"],
    [String(openings), "active openings"],
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-[#0B2E1F] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <p className="mx-auto w-fit rounded-full bg-[#16A34A]/20 px-4 py-1 text-xs font-bold tracking-wide text-[#4ADE80]">
            VERIFIED IT PLACEMENTS · SIWES
          </p>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Real openings. Verified companies. Zero guesswork.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            ITopp connects verified 400-level students with verified companies
            offering IT placements — matched discovery, structured
            applications, and clear status tracking from Applied to Accepted.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link href="/signup">
                  Get started — it&apos;s free <ArrowRight />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="/openings">Browse openings</Link>}
            />
          </div>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4">
            {stats.map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/5 px-2 py-4">
                <p className="text-2xl font-extrabold text-white sm:text-3xl">
                  {value}
                </p>
                <p className="text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <h2 className="text-center text-2xl font-extrabold tracking-tight">
          Built on trust, not luck
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <ShieldCheck className="mb-3 size-6 text-[#16A34A]" />
            <b>Verified both sides</b>
            <p className="mt-1 text-sm text-[#475569]">
              Every company passes a CAC and legitimacy check. Every student
              proves school ID and admission — before anyone posts or applies.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <Search className="mb-3 size-6 text-[#0C6B3C]" />
            <b>Matched first, not buried</b>
            <p className="mt-1 text-sm text-[#475569]">
              Your best-fit openings rank top with reasons shown. No endless
              scrolling through irrelevant posts.
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <Bell className="mb-3 size-6 text-[#D97706]" />
            <b>Always in the loop</b>
            <p className="mt-1 text-sm text-[#475569]">
              Status changes, new matches, and report outcomes land in your
              inbox. Reports reviewed within 48 hours.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-center text-2xl font-extrabold tracking-tight">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#F3F7F4] p-6">
              <GraduationCap className="mb-3 size-6 text-[#0C6B3C]" />
              <p className="text-sm font-extrabold text-[#0C6B3C]">1 · SIGN UP</p>
              <b>Students verify once</b>
              <p className="mt-1 text-sm text-[#475569]">
                Profile + skills + CV + school documents. Approved within 24
                hours.
              </p>
            </div>
            <div className="rounded-xl bg-[#F3F7F4] p-6">
              <Building2 className="mb-3 size-6 text-[#0C6B3C]" />
              <p className="text-sm font-extrabold text-[#0C6B3C]">2 · POST</p>
              <b>Companies publish openings</b>
              <p className="mt-1 text-sm text-[#475569]">
                Quick post in a minute, or custom criteria with screening
                questions.
              </p>
            </div>
            <div className="rounded-xl bg-[#F3F7F4] p-6">
              <ClipboardCheck className="mb-3 size-6 text-[#0C6B3C]" />
              <p className="text-sm font-extrabold text-[#0C6B3C]">3 · TRACK</p>
              <b>Everyone sees the status</b>
              <p className="mt-1 text-sm text-[#475569]">
                Applied → Shortlisted → Accepted. Max 5 active applications, no
                silence-and-guesswork.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/signup">Join the pilot — free</Link>}
            />
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div className="rounded-2xl bg-[#0B2E1F] p-8 text-center text-white sm:p-10">
          <Smartphone className="mx-auto mb-3 size-8 text-[#9ADBB0]" />
          <h2 className="text-2xl font-extrabold tracking-tight">
            Take ITopp anywhere
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
            Install ITopp on your phone — full-screen icon, works even with
            shaky campus internet. Android: one tap. iPhone: Share → Add to
            Home Screen.
          </p>
          <div className="mt-5 flex justify-center">
            <InstallButton large />
          </div>
        </div>
      </section>
    </main>
  );
}
