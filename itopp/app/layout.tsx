import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-[#111827]">
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 text-sm font-semibold">
            <Link href="/" className="text-base font-extrabold">
              ITopp
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="hover:text-[#0B5FFF]">
                Dashboard
              </Link>
              <Link href="/design" className="hover:text-[#0B5FFF]">
                Design
              </Link>
              <Link href="/login" className="hover:text-[#0B5FFF]">
                Log in
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
