"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBanner } from "@/components/verification-banner";
import { logoutAction } from "@/lib/actions";

export interface DashboardData {
  user: { name: string; email: string; role: string; status: "pending" | "verified" | "suspended" };
  studentProfile: { reviewReason: string | null } | null;
  companyProfile: { reviewReason: string | null } | null;
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
          <Button variant="outline" nativeButton={false} render={<Link href="/signup">Sign up</Link>} />
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
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold capitalize">{user.role}</span>
          <StatusBadge status={user.status} />
          <span className="text-[#6B7280]">{user.email}</span>
          <span className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/settings/password">Change password</Link>}
          />
          <Button variant="outline" size="sm" onClick={logout} disabled={busy}>
            Log out
          </Button>
        </CardContent>
      </Card>

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
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/student/profile">My student profile</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/openings">Browse openings</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/applications">My applications</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/notifications">Notifications</Link>}
              />
            </>
          )}
          {isCompany && (
            <>
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/company/profile">My company profile</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/company/postings">My openings</Link>}
              />
              <p className="text-xs text-[#6B7280]">
                Applications to your openings arrive in Phase 4–5.
              </p>
            </>
          )}
          {isAdmin && (
            <>
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/admin/queue">Open verification queue</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/admin/postings">All openings</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/admin/reports">Reports</Link>}
              />
              <Button
                variant="outline"
                className="justify-start"
                nativeButton={false} render={<Link href="/admin/metrics">Trust metrics</Link>}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

