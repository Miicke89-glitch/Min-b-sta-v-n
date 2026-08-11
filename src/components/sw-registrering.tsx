"use client";

import { useEffect } from "react";

export default function SwRegistrering() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline-stöd är trevligt men inte kritiskt — ignorera fel.
      });
    }
  }, []);
  return null;
}
