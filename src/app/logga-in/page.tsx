import { Suspense } from "react";
import LoggaInFormular from "./formular";
import Ikon from "@/components/ikon";

export const metadata = { title: "Logga in — Din bästa vän" };

export default function LoggaInSida() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <span className="symbol mx-auto mb-4 h-16 w-16">
          <Ikon namn="tass" storlek={30} />
        </span>
        <h1 className="text-3xl">Din bästa vän</h1>
        <p className="mt-2 text-blck-mjuk">
          Logga in med din e-postadress — vi skickar en länk, inget lösenord
          behövs.
        </p>
      </div>
      <Suspense>
        <LoggaInFormular />
      </Suspense>
    </main>
  );
}
