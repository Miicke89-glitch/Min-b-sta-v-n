"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Ikon, { type IkonNamn } from "@/components/ikon";

export default function ValpMeny({ valpId }: { valpId: string }) {
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
    <nav
      aria-label="Valpens sidor"
      className="glasmeny fixed inset-x-0 bottom-0 z-10 border-t border-linje pb-[env(safe-area-inset-bottom)]"
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
  );
}
