"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { skapaKlient } from "@/lib/supabase/client";
import Ikon from "@/components/ikon";

export default function LoggaInFormular() {
  const [epost, setEpost] = useState("");
  const [status, setStatus] = useState<"redo" | "skickar" | "skickat">("redo");
  const [fel, setFel] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nasta = searchParams.get("nasta") ?? "/";

  async function skickaLank(e: React.FormEvent) {
    e.preventDefault();
    setStatus("skickar");
    setFel(null);

    const supabase = skapaKlient();
    const { error } = await supabase.auth.signInWithOtp({
      email: epost,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?nasta=${encodeURIComponent(nasta)}`,
      },
    });

    if (error) {
      setFel(error.message);
      setStatus("redo");
    } else {
      setStatus("skickat");
    }
  }

  if (status === "skickat") {
    return (
      <div className="kort p-6 text-center" role="status">
        <span className="symbol mx-auto mb-3 h-14 w-14">
          <Ikon namn="brev" storlek={26} />
        </span>
        <h2 className="text-xl">Kolla din inkorg!</h2>
        <p className="mt-2 text-blck-mjuk">
          Vi har skickat en inloggningslänk till <strong>{epost}</strong>. Öppna
          den på den här enheten.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={skickaLank} className="kort flex flex-col gap-4 p-6">
      <div>
        <label htmlFor="epost" className="etikett">
          E-postadress
        </label>
        <input
          id="epost"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="falt"
          placeholder="du@exempel.se"
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
        />
      </div>
      {fel && (
        <p role="alert" className="text-sm font-medium text-tass-mork">
          Något gick fel: {fel}
        </p>
      )}
      <button type="submit" className="knapp" disabled={status === "skickar"}>
        {status === "skickar" ? "Skickar…" : "Skicka inloggningslänk"}
      </button>
    </form>
  );
}
