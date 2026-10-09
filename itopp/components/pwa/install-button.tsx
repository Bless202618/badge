"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Shows nothing when the app is already installed.
export function InstallButton({ large }: { large?: boolean }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setIos(isIos());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (promptEvent) {
    return (
      <button
        onClick={() => {
          promptEvent.prompt();
          promptEvent.userChoice.then(() => setPromptEvent(null));
        }}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B5FFF] font-medium text-white hover:bg-[#0047CC] ${
          large ? "h-9 px-4 text-sm" : "h-8 px-3 text-sm"
        }`}
      >
        <Download className="size-4" /> Install app
      </button>
    );
  }

  // iPhones: no install pop-up exists — guide them to Share → Add to Home Screen.
  if (ios) {
    return (
      <Dialog>
        <DialogTrigger
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B5FFF] font-medium text-white ${
            large ? "h-9 px-4 text-sm" : "h-8 px-3 text-sm"
          }`}
        >
          <Share className="size-4" /> Install app
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install ITopp on your iPhone</DialogTitle>
            <DialogDescription>
              Apple installs apps from the browser menu:
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              Tap the <b>Share</b> button in Safari&apos;s toolbar.
            </li>
            <li>
              Scroll down and tap <b>Add to Home Screen</b>.
            </li>
            <li>
              Tap <b>Add</b> — ITopp opens full-screen like a real app.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
