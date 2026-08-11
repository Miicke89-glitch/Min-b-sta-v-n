"use client";

import { useState } from "react";

export default function KopieraLank({ token }: { token: string }) {
  const [kopierad, setKopierad] = useState(false);

  async function kopiera() {
    const lank = `${window.location.origin}/inbjudan/${token}`;
    try {
      await navigator.clipboard.writeText(lank);
    } catch {
      window.prompt("Kopiera länken manuellt:", lank);
    }
    setKopierad(true);
    setTimeout(() => setKopierad(false), 2500);
  }

  return (
    <button type="button" onClick={kopiera} className="knapp-sekundar text-sm">
      {kopierad ? "Kopierad! ✓" : "Kopiera inbjudningslänk"}
    </button>
  );
}
