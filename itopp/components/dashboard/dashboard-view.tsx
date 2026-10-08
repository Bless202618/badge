"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBanner } from "@/components/verification-banner";
import { logoutAction } from "@/lib/actions";

export interface DashboardStat {
  label: string;
  value: string;
  href: string;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
    status: "pending" | "verified" | "suspended";
  };
  studentProfile: { reviewReason: string | null } | null;
  companyProfile: { reviewReason: string | null } | null;
  stats: DashboardStat[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardView({ data }: { data: DashboardData | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You are not logged in</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button nativeButton={false} render={<Link href="/login">Log in</Link>} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/signup">Sign up</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  const { user } = data;
  const isStudent = user.role === "student";
  const isCompany = user.role === "company";
  const isAdmin = user.role === "admin";
  const profile = isStudent ? data.studentProfile : data.companyProfile;
  const profileHref = isStudent ? "/student/profile" : "/company/profile";

  async function logout() {
    setBusy(true);
    await logoutAction();
    router.push("/");
  }

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-[#0B5FFF]">
        <CardContent className="flex flex-wrap items-center gap-3 pt-5">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#0B5FFF]/10 text-base font-extrabold text-[#0B5FFF]">
            {initials(user.name)}
          </span>
          <div className="min-w-40 flex-1">
            <p className="text-lg font-extrabold leading-tight">{user.name}</p>
            <p className="text-sm text-[#475569]">
              <span className="font-semibold capitalize">{user.role}</span> ·{" "}
              {user.email}
            </p>
          </div>
          <StatusBadge status={user.status} />
          <span className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/settings/password">Change password</Link>}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={busy}
            >
              Log out
            </Button>
          </span>
        </CardContent>
      </Card>

      {data.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-4">
                  <p className="text-2xl font-extrabold text-[#0A1633]">
                    {s.value}
                  </p>
                  <p className="text-xs font-semibold text-[#475569]">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isAdmin && (
        <VerificationBanner
          status={user.status === "suspended" ? "pending" : user.status}
          reason={profile?.reviewReason ?? undefined}
          profileHref={profileHref}
          profileLabel={
            profile ? "Update and resubmit profile" : "Complete your profile"
          }
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>What next?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isStudent && (
            <>
              <ActionLink href="/student/profile" label="My student profile" />
              <ActionLink href="/openings" label="Browse openings" />
              <ActionLink href="/applications" label="My applications" />
              <ActionLink href="/notifications" label="Notifications" />
            </>
          )}
          {isCompany && (
            <>
              <ActionLink href="/company/profile" label="My company profile" />
              <ActionLink href="/company/postings" label="My openings" />
            </>
          )}
          {isAdmin && (
            <>
              <ActionLink href="/admin/queue" label="Verification queue" />
              <ActionLink href="/admin/postings" label="All openings" />
              <ActionLink href="/admin/reports" label="Reports" />
              <ActionLink href="/admin/metrics" label="Trust metrics" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      variant="outline"
      className="justify-start"
      nativeButton={false}
      render={<Link href={href}>{label}</Link>}
    />
  );
}
