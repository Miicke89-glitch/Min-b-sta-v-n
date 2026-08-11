"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Ikon, { type IkonNamn } from "@/components/ikon";

export default function ValpMeny({
  valpId,
  valpNamn,
}: {
  valpId: string;
  valpNamn: string;
}) {
  const pathname = usePathname();
  const bas = `/valp/${valpId}`;
  const flikar: { href: string; ikon: IkonNamn; etikett: string }[] = [
    { href: bas, ikon: "tass", etikett: "Min valp" },
    { href: `${bas}/tidslinje`, ikon: "kalender", etikett: "Tidslinje" },
    { href: `${bas}/vikt`, ikon: "kurva", etikett: "Vikt" },
    { href: `${bas}/dokument`, ikon: "dokument", etikett: "Dokument" },
    { href: `${bas}/kullen`, ikon: "flock", etikett: "Kullen" },
    { href: `${bas}/fraga`, ikon: "prat", etikett: "Fråga" },
  ];

  return (
    <>
      {/* Sidomeny — desktop */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r border-linje bg-kort px-4 py-6 md:flex">
        <p className="rubrik flex items-center gap-2.5 px-2 text-lg">
          <span className="symbol h-9 w-9">
            <Ikon namn="tass" storlek={19} />
          </span>
          Din bästa vän
        </p>
        <p className="mt-1 px-2 text-sm text-blck-mjuk">{valpNamn}s pärm</p>
        <nav aria-label="Valpens sidor" className="mt-6">
          <ul className="flex flex-col gap-1">
            {flikar.map((flik) => {
              const aktiv = pathname === flik.href;
              return (
                <li key={flik.href}>
                  <Link
                    href={flik.href}
                    aria-current={aktiv ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors ${
                      aktiv
                        ? "bg-tass-ljus text-tass-mork"
                        : "text-blck-mjuk hover:bg-papper hover:text-blck"
                    }`}
                  >
                    <Ikon namn={flik.ikon} storlek={20} />
                    {flik.etikett}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Bottenmeny — mobil */}
      <nav
        aria-label="Valpens sidor"
        className="glasmeny fixed inset-x-0 bottom-0 z-10 border-t border-linje pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto flex max-w-xl">
          {flikar.map((flik) => {
            const aktiv = pathname === flik.href;
            return (
              <li key={flik.href} className="flex-1">
                <Link
                  href={flik.href}
                  aria-current={aktiv ? "page" : undefined}
                  className={`flex min-h-[58px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10.5px] font-semibold transition-colors ${
                    aktiv ? "text-tass-mork" : "text-blck-mjuk hover:text-blck"
                  }`}
                >
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                      aktiv ? "bg-tass-ljus" : "bg-transparent"
                    }`}
                  >
                    <Ikon namn={flik.ikon} storlek={21} />
                  </span>
                  {flik.etikett}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
