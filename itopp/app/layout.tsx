import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { InstallButton } from "@/components/pwa/install-button";
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
  title: "ITopp — Verified IT Placements",
  description:
    "Verified companies meet verified 400-level students. Matched discovery, structured applications, clear status tracking.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ITopp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1633",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const me = await getSessionUser();
  const unread = me
    ? await db.notification.count({
        where: { userId: me.id, readAt: null },
      })
    : 0;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFF] text-[#0A1633]">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm font-semibold">
            <Link href="/" className="text-base font-extrabold">
              ITopp
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/openings" className="hover:text-[#0B5FFF]">
                Openings
              </Link>
              <InstallButton />
              {me ? (
                <>
                  <Link href="/notifications" className="hover:text-[#0B5FFF]">
                    Notifications{unread > 0 ? ` (${unread})` : ""}
                  </Link>
                  <Link href="/dashboard" className="hover:text-[#0B5FFF]">
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link href="/login" className="hover:text-[#0B5FFF]">
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <RegisterSW />
        <footer className="bg-[#0A1633] text-white">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-extrabold">ITopp</p>
              <p className="text-white/70">
                Verified IT placements for 400-level students.
              </p>
            </div>
            <div className="flex gap-4 font-semibold">
              <Link href="/openings" className="hover:text-[#9DBCFF]">
                Openings
              </Link>
              <Link href="/signup" className="hover:text-[#9DBCFF]">
                Sign up
              </Link>
              <Link href="/login" className="hover:text-[#9DBCFF]">
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
