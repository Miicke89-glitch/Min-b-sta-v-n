"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function KullFlikar({ kullId }: { kullId: string }) {
  const pathname = usePathname();
  const bas = `/uppfodare/kullar/${kullId}`;
  const flikar = [
    { href: bas, etikett: "Valpar" },
    { href: `${bas}/dokument`, etikett: "Dokument" },
    { href: `${bas}/rad`, etikett: "Mina råd" },
    { href: `${bas}/fragor`, etikett: "Frågor" },
  ];

  return (
    <nav aria-label="Kullens sidor" className="mt-5 -mx-5 overflow-x-auto px-5">
      <ul className="flex gap-2">
        {flikar.map((flik) => {
          const aktiv = pathname === flik.href;
          return (
            <li key={flik.href}>
              <Link
                href={flik.href}
                aria-current={aktiv ? "page" : undefined}
                className={`inline-block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                  aktiv
                    ? "bg-tass text-white"
                    : "border border-linje bg-kort text-blck-mjuk"
                }`}
              >
                {flik.etikett}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
