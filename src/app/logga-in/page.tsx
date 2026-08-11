import { Suspense } from "react";
import LoggaInFormular from "./formular";

export const metadata = { title: "Logga in — Din bästa vän" };

export default function LoggaInSida() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <p aria-hidden="true" className="mb-3 text-5xl">
          🐾
        </p>
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
