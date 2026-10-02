"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBanner } from "@/components/verification-banner";
import { useStore } from "@/lib/mock-store";

export function DashboardView() {
  const {
    currentUser,
    currentStudentProfile,
    currentCompanyProfile,
    logout,
  } = useStore();

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You are not logged in</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button render={<Link href="/login">Log in</Link>} />
          <Button
            variant="outline"
            render={<Link href="/signup">Sign up</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  const isStudent = currentUser.role === "student";
  const isCompany = currentUser.role === "company";
  const isAdmin = currentUser.role === "admin";
  const profile = isStudent ? currentStudentProfile : currentCompanyProfile;
  const profileHref = isStudent ? "/student/profile" : "/company/profile";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {currentUser.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold capitalize">{currentUser.role}</span>
          <StatusBadge status={currentUser.status} />
          <span className="text-[#6B7280]">{currentUser.email}</span>
          <span className="flex-1" />
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </CardContent>
      </Card>

      {!isAdmin && (
        <VerificationBanner
          status={currentUser.status}
          reason={profile?.reviewReason}
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
                render={<Link href="/student/profile">My student profile</Link>}
              />
              <p className="text-xs text-[#6B7280]">
                Postings + applications unlock here in Phase 3–4, after you are
                verified.
              </p>
            </>
          )}
          {isCompany && (
            <>
              <Button
                variant="outline"
                className="justify-start"
                render={<Link href="/company/profile">My company profile</Link>}
              />
              <p className="text-xs text-[#6B7280]">
                Posting openings unlocks here in Phase 3, after you are
                verified.
              </p>
            </>
          )}
          {isAdmin && (
            <Button
              variant="outline"
              className="justify-start"
              render={<Link href="/admin/queue">Open verification queue</Link>}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
