import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { InstallButton } from "@/components/pwa/install-button";
import { TabBar } from "@/components/layout/tab-bar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIWES Connect — Verified IT Placements",
  description:
    "Verified companies meet verified students. Matched openings, structured applications, clear status tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SIWES Connect",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A3B22",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const me = await getSessionUser();
  const unread = me
    ? await db.notification.count({
        where: { userId: me.id, readAt: null },
      })
    : 0;

  const profileHref =
    !me || me.role === "student" ? "/student/profile" : "/company/profile";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F3F7F4] text-[#0B2E1F] pb-16 md:pb-0">
        <header className="bg-[#0A3B22] text-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 text-sm font-extrabold">
                SC
              </span>
              <span className="leading-tight">
                <span className="flex items-center gap-1.5 text-base font-extrabold">
                  SIWES Connect
                  <span className="rounded bg-[#F5A623] px-1.5 py-0.5 text-[10px] font-extrabold text-[#0A3B22]">
                    NG
                  </span>
                </span>
                <span className="hidden text-[11px] text-white/70 sm:block">
                  ITF-Approved Course Disciplines
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm font-semibold sm:gap-4">
              <Link href="/openings" className="hidden hover:text-[#9ADBB0] sm:block">
                Openings
              </Link>
              <InstallButton />
              {me ? (
                <>
                  <Link
                    href="/notifications"
                    className="relative rounded-full p-1.5 hover:bg-white/10"
                    aria-label="Notifications"
                  >
                    <Bell className="size-5" />
                    {unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#F04438] text-[10px] font-extrabold">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link href="/dashboard" className="hidden hover:text-[#9ADBB0] sm:block">
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link href="/login" className="hover:text-[#9ADBB0]">
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <RegisterSW />
        <TabBar profileHref={profileHref} />
        <footer className="bg-[#0B2E1F] text-white">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-extrabold">SIWES Connect</p>
              <p className="text-white/70">
                Verified placements for SIWES students.
              </p>
            </div>
            <div className="flex gap-4 font-semibold">
              <Link href="/openings" className="hover:text-[#9ADBB0]">
                Openings
              </Link>
              <Link href="/signup" className="hover:text-[#9ADBB0]">
                Sign up
              </Link>
              <Link href="/login" className="hover:text-[#9ADBB0]">
                Log in
              </Link>
            </div>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
