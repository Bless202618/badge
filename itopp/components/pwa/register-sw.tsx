"use client";

import { useEffect } from "react";

// Registers the service worker once. Safe on localhost + HTTPS.
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline features simply stay off; the app still works online.
      });
    }
  }, []);
  return null;
}
